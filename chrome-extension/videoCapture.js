// Upload helper
async function uploadToBackend(blob, metadata) {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");
  if (metadata) {
    formData.append("tags", metadata.tags || "");
    formData.append("notes", metadata.notes || "");
    formData.append("sourceURL", metadata.sourceURL || "");
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
      hoverBtn.style.display = "none";
      e.stopPropagation();
      e.preventDefault();

      const rect = video.getBoundingClientRect();
      const left = rect.left + window.scrollX;
      const top = rect.top + window.scrollY;
      const right = rect.right + window.scrollX;
      const bottom = rect.bottom + window.scrollY;

      // Overlays
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

      const stopBtn = document.createElement("button");
      stopBtn.textContent = "⏹ Stop";
      stopBtn.style.background = "#e53935";
      stopBtn.style.color = "white";
      stopBtn.style.border = "none";
      stopBtn.style.padding = "6px 14px";
      stopBtn.style.borderRadius = "8px";
      stopBtn.style.cursor = "pointer";

      const timer = document.createElement("span");
      timer.textContent = "00:00";
      timer.style.fontSize = "14px";
      timer.style.fontWeight = "bold";
      timer.style.color = "#76ff03";

      const deleteBtn = document.createElement("button");
      deleteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" 
            width="16" height="16" fill="white">
          <path d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 
                  32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1
                  C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 
                  21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 
                  512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"/>
        </svg>`;
      deleteBtn.style.background = "transparent";
      deleteBtn.style.border = "none";
      deleteBtn.style.cursor = "pointer";

      function cleanupUI() {
        overlays.forEach((o) => o.remove());
        controlPanel.remove();
        clearInterval(timerInterval);
        timer.textContent = "00:00";
        hoverBtn.style.display = "block";
      }

      function updateTimer() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
        const secs = String(elapsed % 60).padStart(2, "0");
        timer.textContent = `${mins}:${secs}`;
      }

      // Recording
      let stream = null;
      try {
        if (video.captureStream) stream = video.captureStream();
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
          return;
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
        form.style.padding = "16px";
        form.style.border = "1px solid #ccc";
        form.style.borderRadius = "12px";
        form.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
        form.style.width = "280px";
        form.style.fontFamily = "sans-serif";

        form.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <span style="cursor:pointer;font-weight:bold;" id="closeBtn">❌</span>
          </div>
          
          <label style="font-size:13px;font-weight:600;">Tags</label>
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:12px;">
            <input id="recTags" type="text" placeholder="comma separated" 
              style="flex:1;padding:6px;border:1px solid #ccc;border-radius:6px;">
          </div>

          <label style="font-size:13px;font-weight:600;">Notes</label>
          <textarea id="recNotes" rows="3" 
            style="width:100%;margin:6px 0 12px;padding:6px;border:1px solid #ccc;border-radius:6px;"></textarea>

          <button id="recSave" 
            style="width:100%;background:#4caf50;color:white;border:none;padding:10px;border-radius:8px;font-weight:bold;cursor:pointer;">
            Create Fragment
          </button>
        `;
        document.body.appendChild(form);

        form.querySelector("#closeBtn").onclick = () => form.remove();
        form.querySelector("#recSave").onclick = () => {
          const metadata = {
            tags: form.querySelector("#recTags").value,
            notes: form.querySelector("#recNotes").value,
            sourceURL: window.location.href,
            user_id: "demo-user-123" // use auth0 to make dynamic
          };
          uploadToBackend(blob, metadata);
          form.remove();
        };
      };

      recorder.start(2000);
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);

      stopBtn.onclick = () => {
        if (recorder && recorder.state === "recording") {
          cleanupUI();
          recorder.stop();
        }
      };

      deleteBtn.onclick = () => {
        if (recorder && recorder.state === "recording") {
          cancelled = true;
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
