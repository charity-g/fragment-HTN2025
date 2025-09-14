// Upload helper
async function uploadToBackend(blob, metadata) {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");
  if (metadata) {
    formData.append("tags", metadata.tags || "");
    formData.append("notes", metadata.notes || "");
    formData.append("sourceURL", metadata.sourceURL || "");
    formData.append("privacy", metadata.privacy || "");
    formData.append("user_id", metadata.user_id || "");
  }

  try {
    const resp = await fetch(`http://localhost:8000/upload`, {
      method: "POST",
      body: formData,
    });

    if (!resp.ok) throw new Error(`Upload failed: ${resp.statusText}`);

    const data = await resp.json();
    console.log("Upload response:", data);
    // alert("Uploaded to backend: " + JSON.stringify(data));
  } catch (err) {
    console.error("Error uploading video:", err);
    // alert("Upload failed: " + err.message);
  }
}

function injectButtons() {
  document.querySelectorAll("video").forEach((video) => {
    if (video.dataset.hasRecorderBtn) return;
    video.dataset.hasRecorderBtn = true;

    const hoverBtn = document.createElement("button");
    const iconPath = chrome.runtime.getURL("fragmentsLogo.svg");
    hoverBtn.innerHTML = `<img src="${iconPath}" alt="Record" style="width:16px;height:auto;filter:invert(100%);top: 2px;position: relative;left: 1px;"/>`;
    hoverBtn.style.position = "absolute";
    hoverBtn.style.left = "8px";
    hoverBtn.style.top = "8px";
    hoverBtn.style.zIndex = "10001";
    hoverBtn.style.background = "black";
    hoverBtn.style.color = "white";
    hoverBtn.style.border = "none";
    hoverBtn.style.padding = "8px 10px";
    hoverBtn.style.cursor = "pointer";
    hoverBtn.style.borderRadius = "50%";
    hoverBtn.style.opacity = "0.8";

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
      makeOverlay({
        top: "0px",
        left: "0px",
        width: "100%",
        height: top + "px",
      });
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
      stopBtn.textContent = "⏹ End Recording";
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
      timer.style.color = "#fff";

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

      recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        chunks = [];
        clearInterval(timerInterval);

        if (cancelled) {
          cancelled = false;
          overlays.forEach((o) => o.remove());
          return;
        }

        // Remove control panel, but keep overlay until form closes
        controlPanel.remove();

        // --- Dark Metadata Popup ---
        const form = document.createElement("div");
        form.style.position = "fixed";
        form.style.zIndex = "10002"; // above overlay
        form.style.background = "#1e1e1e";
        form.style.color = "white";
        form.style.padding = "20px";
        form.style.borderRadius = "16px";
        form.style.boxShadow = "0 4px 16px rgba(0,0,0,0.6)";
        form.style.width = "320px";
        form.style.fontFamily = "sans-serif";

        // Animation styles
        form.style.transform = "scale(0.6)";
        form.style.opacity = "0";
        form.style.transition =
          "transform 0.25s ease-out, opacity 0.25s ease-out";
        form.style.right = "0px";
        form.style.top = "0px";

        // Delay applying final state so transition runs
        requestAnimationFrame(() => {
          form.style.transform = "scale(1)";
          form.style.opacity = "1";
          form.style.right = "20px";
          form.style.top = "20px";
        });

        form.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
            <h3 style="margin:0;font-size:16px;">Save Recording</h3>
            <span style="cursor:pointer;font-size:18px;" id="closeBtn">✕</span>
          </div>


          <label style="font-size:12px;letter-spacing:1px;display:block;margin-bottom:6px;">TAG</label>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;">
            <input id="tagInput" type="text" placeholder="Add tag" 
              style="flex:1;padding:10px;border-radius:20px;background:#2a2a2a;color:white;border:none;">
            <button id="addTagBtn" style="width:34px;height:34px;border-radius:50%;border:none;background:#444;color:white;cursor:pointer;">＋</button>
          </div>
          <div id="tagContainer" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px;"></div>

          <label style="font-size:12px;letter-spacing:1px;display:block;margin-bottom:6px;">NOTES</label>
          <textarea id="recNotes" rows="3" placeholder="Type here to add a note..." 
            style="width:100%;padding:12px;border-radius:12px;background:#2a2a2a;color:white;border:none;margin-bottom:18px;"></textarea>

          <div style="display:flex;justify-content:space-between;align-items:center;">
            <button id="privacyBtn" 
              style="flex:1;margin-right:10px;padding:10px;border-radius:20px;background:transparent;border:1px solid white;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
              🔒 Private
            </button>
            <button id="recSave" 
              style="flex:1;background:white;color:black;border:none;padding:10px;border-radius:20px;font-weight:bold;cursor:pointer;">
              Create Fragment
            </button>
          </div>
        `;
        document.body.appendChild(form);

        // Close handler
        form.querySelector("#closeBtn").onclick = () => {
          form.remove();
          overlays.forEach((o) => o.remove());
          hoverBtn.style.display = "block";
        };

        // Privacy toggle
        const privacyBtn = form.querySelector("#privacyBtn");
        let isPrivate = true;
        privacyBtn.onclick = () => {
          isPrivate = !isPrivate;
          privacyBtn.textContent = isPrivate ? "🔒 Private" : "🌐 Public";
        };

        // Tag pills
        const tagInput = form.querySelector("#tagInput");
        const tagContainer = form.querySelector("#tagContainer");
        const addTagBtn = form.querySelector("#addTagBtn");
        const tags = [];

        function renderTags() {
          tagContainer.innerHTML = "";
          tags.forEach((tag, idx) => {
            const pill = document.createElement("div");
            pill.innerHTML = `<span>${tag}</span> <span style="cursor:pointer;">✕</span>`;
            pill.style.background = "#000";
            pill.style.padding = "6px 12px";
            pill.style.borderRadius = "20px";
            pill.style.display = "flex";
            pill.style.alignItems = "center";
            pill.style.gap = "6px";
            pill.style.fontSize = "13px";
            pill.querySelector("span:last-child").onclick = () => {
              tags.splice(idx, 1);
              renderTags();
            };
            tagContainer.appendChild(pill);
          });
        }

        addTagBtn.onclick = () => {
          const value = tagInput.value.trim();
          if (value && !tags.includes(value)) {
            tags.push(value);
            tagInput.value = "";
            renderTags();
          }
        };

        // Save handler
        form.querySelector("#recSave").onclick = () => {
          const metadata = {
            notes: form.querySelector("#recNotes").value,
            tags: tags.join(","),
            sourceURL: window.location.href,
            user_id: "demo",
            privacy: isPrivate ? "private" : "public",
          };
          uploadToBackend(blob, metadata);
          form.remove();
          overlays.forEach((o) => o.remove());
          hoverBtn.style.display = "block";
        };
      };

      recorder.start(2000);
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);

      stopBtn.onclick = () => {
        if (recorder && recorder.state === "recording") {
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
