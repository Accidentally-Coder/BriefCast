let summaryText = "";
let transcriptText = "";

document
    .querySelector(".audio-upload-btn")
    .addEventListener("click", function () {
        // Trigger click on the hidden file input
        document.getElementById("audio-file-input").click();
        console.log("clicked");
    });

document
    .getElementById("audio-file-input")
    .addEventListener("change", function (event) {
        const fileInput = event.target;
        const selectedFile = fileInput.files[0];

        if (selectedFile) {
            // Handle the selected file (e.g., upload or process it)

            console.log("Selected file:", selectedFile);
            const formData = new FormData();
            formData.append("audio", selectedFile);
            let chatBox = document.getElementById("chat-box");

            // Create a new chat bubble element
            let newChat = document.createElement("div");
            newChat.classList.add("chat", "chat-start", "m-4");
            let chatBubble = document.createElement("div");
            chatBubble.classList.add("chat-bubble");
            // Assuming the API response contains the summary
            newChat.appendChild(chatBubble);

            // Append the new chat bubble to the chat box
            chatBox.appendChild(newChat);

            // Scroll to the bottom of the chat box
            chatBox.scrollTop = chatBox.scrollHeight;
            // Make a Fetch API request to your Flask API
            fetch("https://m...content-available-to-author-only...e.app/transcribe_audio", {
                method: "POST",
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Response from API:", data);
                    console.log(data.transcript);
                    transcriptText = data.transcript;
                    const transcriptData = {
                        transcript: transcriptText,
                    };

                    // Convert the object to JSON
                    const jsonData = JSON.stringify(transcriptData);

                    // Send the fetch request
                    fetch("https://m...content-available-to-author-only...e.app/summarize", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json", // Specify content type as JSON
                        },
                        body: jsonData,
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            summaryText = data.summary;
                            console.log("Printing Summary", summaryText);
                            chatBubble.innerText = summaryText; // Update UI with summary text
                        })
                        .catch((error) => {
                            // Handle errors
                            console.error("Error:", error);
                        });
                })
                .catch((error) => {
                    // Handle errors
                    console.error("Error:", error);
                });
        }
    });

document
    .querySelector(".video-upload-btn")
    .addEventListener("click", function () {
        // Trigger click on the hidden file input
        document.getElementById("video-file-input").click();
        console.log("clicked");
    });
document
    .getElementById("video-file-input")
    .addEventListener("change", function (event) {
        const fileInput = event.target;
        const selectedFile = fileInput.files[0];

        if (selectedFile) {
            // Handle the selected file (e.g., upload or process it)

            console.log("Selected file:", selectedFile);
            const formData = new FormData();
            formData.append("video", selectedFile);
            let chatBox = document.getElementById("chat-box");

            // Create a new chat bubble element
            let newChat = document.createElement("div");
            newChat.classList.add("chat", "chat-start", "m-4");
            let chatBubble = document.createElement("div");
            chatBubble.classList.add("chat-bubble");
            // Assuming the API response contains the summary
            newChat.appendChild(chatBubble);

            // Append the new chat bubble to the chat box
            chatBox.appendChild(newChat);

            // Scroll to the bottom of the chat box
            chatBox.scrollTop = chatBox.scrollHeight;
            // Make a Fetch API request to your Flask API
            fetch("https://m...content-available-to-author-only...e.app/transcribe_video", {
                method: "POST",
                body: formData,
                mode: "cors",
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Response from API:", data);
                    console.log(data.transcript);
                    transcriptText = data.transcript;
                    const transcriptData = {
                        transcript: transcriptText,
                    };

                    // Convert the object to JSON
                    const jsonData = JSON.stringify(transcriptData);

                    // Send the fetch request
                    fetch("https://m...content-available-to-author-only...e.app/summarize", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json", // Specify content type as JSON
                        },
                        body: jsonData,
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            summaryText = data.summary;
                            console.log("Printing Summary", summaryText);
                            chatBubble.innerText = summaryText; // Update UI with summary text
                        })
                        .catch((error) => {
                            // Handle errors
                            console.error("Error:", error);
                        });
                })
                .catch((error) => {
                    // Handle errors
                    console.error("Error:", error);
                });
        }
    });

// Event listener for the download button
document.getElementById("download-btn").addEventListener("click", function () {
    // Make a fetch request to your Flask API endpoint
    fetch("https://m...content-available-to-author-only...e.app/summarize_txt", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            transcript: "Your transcript data here",
        }),
    })
        .then((response) => response.blob()) // Convert the response to a Blob
        .then((blob) => {
            // Create a temporary URL for the Blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary <a> element to trigger the download
            const a = document.createElement("a");
            a.href = url;
            a.download = "summary.txt"; // Set the filename for the downloaded file
            document.body.appendChild(a);
            a.click(); // Trigger the download
            window.URL.revokeObjectURL(url); // Revoke the URL object to release resources
        })
        .catch((error) => {
            console.error("Error:", error);
            // Handle errors here
        });
});

function showToast(message, type) {
    const toast = document.querySelector(".toast");
    const alertInfo = toast.querySelector(".alert-info");
    const alertSuccess = toast.querySelector(".alert-success");

    if (type === "info") {
        alertInfo.textContent = message;
        alertInfo.style.display = "block";
        alertSuccess.style.display = "none";
    } else if (type === "success") {
        alertSuccess.textContent = message;
        alertSuccess.style.display = "block";
        alertInfo.style.display = "none";
    }

    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

// Event listener for the email button
document.getElementById("email-btn").addEventListener("click", function () {
    // Make a fetch request to the send_mail endpoint
    fetch("https://m...content-available-to-author-only...e.app/send_mail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            summary: summaryText, // Replace with the actual summary data
        }),
    })
        .then((response) => {
            if (response.ok) {
                // Email sent successfully
                console.log("Email Sent.")
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            // Handle errors here
        });
});

document.getElementById("class-notes").addEventListener("click", function () {
    // Make a POST request to the API endpoint
    fetch("https://m...content-available-to-author-only...e.app/summarize_as_class_notes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            transcript: transcriptText, // Replace 'Your transcript data here' with the actual transcript data
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            // Handle the response data here
            console.log("Printing Class Summary");
            console.log(data.summary); // Log the summary to the console
        })
        .catch((error) => {
            // Handle any errors here
            console.error("Error:", error);
        });
});
