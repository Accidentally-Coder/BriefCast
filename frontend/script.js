document.querySelector(".audio-upload-btn").addEventListener("click", function () {
    // Trigger click on the hidden file input
    document.getElementById("audio-file-input").click();
});

document.getElementById("audio-file-input").addEventListener("change", function (event) {
    const fileInput = event.target;
    const selectedFile = fileInput.files[0];

    if (selectedFile) {
        // Handle the selected file (e.g., upload or process it)
        console.log("Selected file:", selectedFile);
        const formData = new FormData();
        formData.append("audio_file", selectedFile);

        // Make a Fetch API request to your Flask API
        fetch("https://monthly-guided-cow.ngrok.free.app/transcribe_audio", {
            method: "POST",
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                // Handle the response from the Flask API
                console.log("Response from API:", data);
            })
            .catch(error => {
                // Handle errors
                console.error("Error:", error);
            });
    }
});

