// Upload helper
async function uploadToBackend(blob, metadata) {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");
  if (metadata) {
    formData.append("title", metadata.title);
    formData.append("description", metadata.description);
    formData.append("tags", metadata.tags);
  }

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

    const hoverBtn = document.createElement("button");
    hoverBtn.textContent = "🎥";
    hoverBtn.style.position = "absolute";
    hoverBtn.style.left = "8px";
    hoverBtn.style.top = "8px";
    hoverBtn.style.zIndex = "10001";
    hoverBtn.style.background = "black";
    hoverBtn.style.color = "white";
    hoverBtn.style.border = "none";
    hoverBtn.style.padding = "4px 6px";
    hoverBtn.style.cursor = "pointer";
    hoverBtn.style.borderRadius = "50%";

    let recorder = null;
    let chunks = [];
    let timerInterval = null;
    let startTime = null;
    let cancelled = false;

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
      makeOverlay({ top: "0px", left: "0px", width: "100%", height: top + "px" });
      makeOverlay({
        top: bottom + "px",
        left: "0px",
        width: "100%",
        height: document.documentElement.scrollHeight - bottom + "px",
      });
      makeOverlay({
        top: top + "px",
        left: "0px",
        width: left + "px",
        height: rect.height + "px",
      });
      makeOverlay({
        top: top + "px",
        left: right + "px",
        width: document.documentElement.scrollWidth - right + "px",
        height: rect.height + "px",
      });

      // Control panel
      const controlPanel = document.createElement("div");
      controlPanel.style.position = "absolute";
      controlPanel.style.top = bottom + 15 + "px";
      controlPanel.style.left = left + "px";
      controlPanel.style.zIndex = "10000";
      controlPanel.style.background = "#1e1e1e";
      controlPanel.style.color = "white";
      controlPanel.style.padding = "10px 16px";
      controlPanel.style.borderRadius = "12px";
      controlPanel.style.boxShadow = "0 4px 12px rgba(0,0,0,0.4)";
      controlPanel.style.display = "flex";
      controlPanel.style.alignItems = "center";
      controlPanel.style.gap = "15px";
      controlPanel.style.fontFamily = "sans-serif";

      const stopBtn = document.createElement("button");
      stopBtn.textContent = "⏹ Stop";
      stopBtn.style.background = "#e53935";
      stopBtn.style.color = "white";
      stopBtn.style.border = "none";
      stopBtn.style.padding = "6px 14px";
      stopBtn.style.borderRadius = "8px";
      stopBtn.style.cursor = "pointer";
      stopBtn.style.fontSize = "14px";
      stopBtn.style.fontWeight = "bold";

      const timer = document.createElement("span");
      timer.textContent = "00:00";
      timer.style.fontSize = "14px";
      timer.style.fontWeight = "bold";
      timer.style.color = "#76ff03";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "❌ Delete";
      deleteBtn.style.background = "#444";
      deleteBtn.style.color = "white";
      deleteBtn.style.border = "none";
      deleteBtn.style.padding = "6px 12px";
      deleteBtn.style.borderRadius = "8px";
      deleteBtn.style.cursor = "pointer";

      function cleanupUI() {
        overlays.forEach((o) => o.remove());
        controlPanel.remove();
        clearInterval(timerInterval);
        timer.textContent = "00:00";
      }

      function updateTimer() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
        const secs = String(elapsed % 60).padStart(2, "0");
        timer.textContent = `${mins}:${secs}`;
      }

      // Start recording immediately
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
        clearInterval(timerInterval);

        if (cancelled) {
          cancelled = false;
          return; // don't show form if deleted
        }

        cleanupUI();

        // Metadata popup
        const form = document.createElement("div");
        form.style.position = "fixed";
        form.style.right = "20px";
        form.style.top = "20px";
        form.style.zIndex = "10001";
        form.style.background = "white";
        form.style.color = "black";
        form.style.padding = "14px";
        form.style.border = "1px solid #ccc";
        form.style.borderRadius = "10px";
        form.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
        form.style.width = "250px";
        form.innerHTML = `
          <h4 style="margin: 0 0 10px 0; font-family: sans-serif;">Save Recording</h4>
          <label style="font-size: 13px;">Title:<br><input id="recTitle" type="text" style="width:100%; margin-bottom:8px;"></label><br>
          <label style="font-size: 13px;">Description:<br><textarea id="recDesc" style="width:100%; margin-bottom:8px;"></textarea></label><br>
          <label style="font-size: 13px;">Tags:<br><input id="recTags" type="text" placeholder="comma separated" style="width:100%; margin-bottom:8px;"></label><br>
          <button id="recSave" style="background:#4caf50;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">Save</button>
          <button id="recCancel" style="margin-left:8px;background:#ccc;color:black;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">Cancel</button>
        `;
        document.body.appendChild(form);

        form.querySelector("#recSave").onclick = () => {
          const metadata = {
            title: form.querySelector("#recTitle").value,
            description: form.querySelector("#recDesc").value,
            tags: form.querySelector("#recTags").value,
          };
          uploadToBackend(blob, metadata);
          form.remove();
        };
        form.querySelector("#recCancel").onclick = () => form.remove();
      };

      recorder.start(2000);
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);

      stopBtn.onclick = () => {
        if (recorder && recorder.state === "recording") {
          cleanupUI(); // remove overlay + panel immediately
          recorder.stop();
        }
      };

      deleteBtn.onclick = () => {
        if (recorder && recorder.state === "recording") {
          cancelled = true; // mark so form won't appear
          recorder.stop();
        }
        cleanupUI();
      };

      controlPanel.appendChild(stopBtn);
      controlPanel.appendChild(timer);
      controlPanel.appendChild(deleteBtn);
      document.body.appendChild(controlPanel);
    };

    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    video.parentNode.insertBefore(wrapper, video);
    wrapper.appendChild(video);
    wrapper.appendChild(hoverBtn);
  });
}

injectButtons();
new MutationObserver(() => injectButtons()).observe(document.body, {
  childList: true,
  subtree: true,
});
