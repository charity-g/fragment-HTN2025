let recorder;
let chunks = [];

async function uploadToBackend(blob) {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");

  try {
    const resp = await fetch(`http://localhost:8000/upload`, {
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


document.getElementById("start").onclick = async (capture = "tab") => {
  // <video> capture
  

  // tab capture
  chrome.tabCapture.capture(
    {
      video: true,
      audio: false,
      videoConstraints: {
        mandatory: {
          minWidth: 1280,
          minHeight: 720,
          maxWidth: 1280,
          maxHeight: 720,
          // maxFrameRate: 30
        },
      },
    },
    (stream) => {
      if (!stream) {
        console.error("Could not capture tab.");
        return;
      }

      recorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp9",
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        chunks = [];

        uploadToBackend(blob);

        // If you still want local download for backup:
        // const url = URL.createObjectURL(blob);
        // const a = document.createElement("a");
        // a.href = url;
        // a.download = "recording.webm";
        // a.click();
      };

      recorder.start(2000); // collect in 2s chunks
    }
  );
};

document.getElementById("stop").onclick = () => {
  if (recorder) {
    recorder.stop();
  }
};
