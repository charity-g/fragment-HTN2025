// Define as global function for non-module Chrome extension usage
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
    // alert("Uploaded to backend: " + JSON.stringify(data));
  } catch (err) {
    console.error("Error uploading video:", err);
    // alert("Upload failed: " + err.message);
  }
}

window.uploadToBackend = uploadToBackend;
