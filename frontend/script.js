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
      fetch("https://monthly-guided-cow.ngrok-free.app/transcribe_audio", {
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
          fetch("https://monthly-guided-cow.ngrok-free.app/summarize", {
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
      fetch("https://monthly-guided-cow.ngrok-free.app/transcribe_video", {
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
          fetch("https://monthly-guided-cow.ngrok-free.app/summarize", {
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
document.getElementById("download-btn").addEventListener("click", function() {
    // Make a fetch request to your Flask API endpoint
    fetch("https://monthly-guided-cow.ngrok-free.app/summarize_txt", {
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


// Event listener for the email button
document.getElementById("email-btn").addEventListener("click", function() {
    // Make a fetch request to the send_mail endpoint
    fetch("https://monthly-guided-cow.ngrok-free.app/send_mail", {
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
          console.log("Email sent!");
        } else {
          // Error handling
          console.error("Failed to send email:", response.statusText);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // Handle errors here
      });
});


