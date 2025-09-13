let recorder;
let chunks = [];

document.getElementById("start").onclick = async () => {
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
            }
        }
    }, (stream) => {
        if (!stream) {
        console.error("Could not capture tab.");
        return;
        }

        recorder = new MediaRecorder(stream, {
        mimeType: "video/webm; codecs=vp9"
        });

        recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        chunks = [];
        
        // Downloads video
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recording.webm";
        a.click();

        // TODO: upload video to s3 using backend instead of locally

        };

        recorder.start(2000); // collect in 2s chunks
  });
};

document.getElementById("stop").onclick = () => {
  if (recorder) {
    recorder.stop();
  }
};
