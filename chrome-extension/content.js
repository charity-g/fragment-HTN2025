
async function uploadToBackend(blob) {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");

  try {
    const resp = await fetch(`http://0.0.0.0:8000/upload`, {
      method: "POST",
      body: formData,
    });

    if (!resp.ok) {
      throw new Error(`Upload failed: ${resp.statusText}`);
    }

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

    // Create wrapper div for relative positioning
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";

    // Insert wrapper around the video
    video.parentNode.insertBefore(wrapper, video);
    wrapper.appendChild(video);

    // Create the record button
    const btn = document.createElement("button");
    btn.textContent = "🎥 Record";
    btn.style.position = "absolute";
    btn.style.top = "8px";
    btn.style.left = "8px";
    btn.style.zIndex = "9999";
    btn.style.background = "red";
    btn.style.color = "white";
    btn.style.border = "none";
    btn.style.padding = "4px 6px";
    btn.style.width = "100px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "12px";
    btn.style.borderRadius = "4px";

    let recorder = null;
    let chunks = [];

    btn.onclick = () => {
      if (!recorder || recorder.state === "inactive") {
        let stream = null;
        try {
          if (video.captureStream) {
            stream = video.captureStream();
          }
        } catch (err) {
          console.warn("captureStream blocked (likely DRM), falling back", err);
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
          // If you still want local download for backup:
          // const url = URL.createObjectURL(blob);
          // const a = document.createElement("a");
          // a.href = url;
          // a.download = "element-recording.webm";
          // a.click();

          // Upload to backend
          console.log("Uploading video blob to backend...");
          uploadToBackend(blob);
          console.log("Video uploaded to backend. video???");

          btn.textContent = "🎥 Record";
          btn.style.background = "red";
        };

        recorder.start(2000);
        btn.textContent = "⏸ Stop";
        btn.style.background = "orange";
      } else if (recorder.state === "recording") {
        recorder.stop();
      }
    };

    wrapper.appendChild(btn);
  });
}

// run on page load
injectButtons();

// re-run when new videos appear (Instagram reels are lazy-loaded)
const observer = new MutationObserver(() => injectButtons());
observer.observe(document.body, { childList: true, subtree: true });
