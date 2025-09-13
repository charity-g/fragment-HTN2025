// Upload helper
async function uploadToBackend(blob) {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");

  try {
    const resp = await fetch(`http://localhost:8000/upload`, {
      method: "POST",
      body: formData,
    });

    if (!resp.ok) throw new Error(`Upload failed: ${resp.statusText}`);

    const data = await resp.json();
    console.log("Upload response:", data);
    alert("Uploaded to backend: " + JSON.stringify(data));
  } catch (err) {
    console.error("Error uploading video:", err);
    alert("Upload failed: " + err.message);
  }
}

function injectButtons() {
  document.querySelectorAll("video").forEach((video) => {
    if (video.dataset.hasRecorderBtn) return;
    video.dataset.hasRecorderBtn = true;

    // Hover button
    const hoverBtn = document.createElement("button");
    hoverBtn.textContent = "🎥";
    hoverBtn.style.position = "absolute";
    hoverBtn.style.right = "8px";
    hoverBtn.style.top = "8px";
    hoverBtn.style.zIndex = "10001";
    hoverBtn.style.background = "black";
    hoverBtn.style.color = "white";
    hoverBtn.style.border = "none";
    hoverBtn.style.padding = "4px 6px";
    hoverBtn.style.cursor = "pointer";
    hoverBtn.style.borderRadius = "50%";
    // hoverBtn.style.display = "none"; // only show on hover

    // Show/hide button on hover
    // video.addEventListener("mouseenter", () => (hoverBtn.style.display = "block"));
    // video.addEventListener("mouseleave", () => (hoverBtn.style.display = "none"));

    let recorder = null;
    let chunks = [];

    hoverBtn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();

      const rect = video.getBoundingClientRect();
      const left = rect.left + window.scrollX;
      const top = rect.top + window.scrollY;
      const right = rect.right + window.scrollX;
      const bottom = rect.bottom + window.scrollY;

      // 4 overlays around the video
      const overlays = [];
      function makeOverlay(styles) {
        const div = document.createElement("div");
        Object.assign(div.style, {
          position: "absolute",
          background: "rgba(0,0,0,0.8)",
          zIndex: "9998",
          ...styles,
        });
        document.body.appendChild(div);
        overlays.push(div);
      }

      // Top
      makeOverlay({ top: "0px", left: "0px", width: "100%", height: top + "px" });
      // Bottom
      makeOverlay({
        top: bottom + "px",
        left: "0px",
        width: "100%",
        height: document.documentElement.scrollHeight - bottom + "px",
      });
      // Left
      makeOverlay({
        top: top + "px",
        left: "0px",
        width: left + "px",
        height: rect.height + "px",
      });
      // Right
      makeOverlay({
        top: top + "px",
        left: right + "px",
        width: document.documentElement.scrollWidth - right + "px",
        height: rect.height + "px",
      });

      // Control panel below video
      const controlPanel = document.createElement("div");
      controlPanel.style.position = "absolute";
      controlPanel.style.top = bottom + 10 + "px";
      controlPanel.style.left = left + "px";
      controlPanel.style.zIndex = "10000";
      controlPanel.style.background = "white";
      controlPanel.style.padding = "10px";
      controlPanel.style.borderRadius = "8px";
      controlPanel.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      controlPanel.style.display = "flex";
      controlPanel.style.gap = "10px";

      const recordBtn = document.createElement("button");
      recordBtn.textContent = "▶ Record";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "❌ Delete";

      // Record button logic
      recordBtn.onclick = () => {
        if (!recorder || recorder.state === "inactive") {
          let stream = null;
          try {
            if (video.captureStream) {
              stream = video.captureStream();
            }
          } catch (err) {
            console.warn("captureStream blocked (likely DRM). Falling back.");
          }

          if (!stream) {
            chrome.runtime.sendMessage({ action: "startTabCapture" });
            return;
          }

          recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            chunks = [];
            uploadToBackend(blob);
            recordBtn.textContent = "▶ Record";
          };

          recorder.start(2000);
          recordBtn.textContent = "⏸ Stop";
        } else if (recorder.state === "recording") {
          recorder.stop();
        }
      };

      // Delete button logic
      deleteBtn.onclick = () => {
        if (recorder && recorder.state === "recording") recorder.stop();
        overlays.forEach((o) => o.remove());
        controlPanel.remove();
      };

      controlPanel.appendChild(recordBtn);
      controlPanel.appendChild(deleteBtn);
      document.body.appendChild(controlPanel);
    };

    // Wrap video for relative positioning and add hoverBtn
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    video.parentNode.insertBefore(wrapper, video);
    wrapper.appendChild(video);
    wrapper.appendChild(hoverBtn);
  });
}

// Run on load
injectButtons();

// Re-run for dynamically loaded videos (e.g., Instagram reels)
new MutationObserver(() => injectButtons()).observe(document.body, {
  childList: true,
  subtree: true,
});
