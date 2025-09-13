let recorder;
let chunks = [];

async function startTabCapture() {
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
        },
      },
    },
    (stream) => {
      if (!stream) {
        console.error("Could not capture tab.");
        return;
      }

      recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        chunks = [];
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "tab-recording.webm";
        a.click();
      };

      recorder.start(2000);
    }
  );
}

document.getElementById("captureTab").onclick = () => startTabCapture();
document.getElementById("stop").onclick = () => recorder && recorder.stop();

// Listen for "startVideoCapture" messages from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "startVideoCapture" && msg.streamId) {
    navigator.mediaDevices.getUserMedia({
      video: { mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: msg.streamId } }
    }).then((stream) => {
      recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9" });
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        chunks = [];
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "video-element-recording.webm"; 
        a.click();
      };
      recorder.start(2000);
    });
  }
});
