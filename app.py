from flask import Flask, request, jsonify, send_file
import requests
import os
import moviepy.editor as mp
import tempfile
from openai import OpenAI
from flask_cors import CORS
from flask_mail import Mail, Message
from io import BytesIO

# openai.api_key = "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"
os.environ['OPENAI_API_KEY'] = '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'

client = OpenAI()
app = Flask(__name__)

CORS(app, origins="*")

app.config['MAIL_SERVER'] = 'smtp-relay.brevo.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USERNAME'] = 'briefcast@proton.me'
app.config['MAIL_PASSWORD'] = 'hj9x8RWNMqzmPOSy'
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False

mail = Mail(app)


@app.route('/transcribe_audio', methods=['POST'])
def transcribe_audio():
    # Define the API endpoint
    endpoint = "https://api.openai.com/v1/audio/transcriptions"

    # Define the headers with your API key
    headers = {
        "Authorization": "Bearer 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"
    }

    # Define chunk size (adjust as needed)
    chunk_size = 4096 * 4096  # 1 MB chunk size

    # Get the audio file from the request
    audio_file = request.files['audio']

    # Initialize an empty list to store responses
    all_responses = []

    # Initialize concatenated response string
    concatenated_response = ""

    # Read the audio file in chunks and send API calls for each chunk
    while True:
        chunk = audio_file.read(chunk_size)
        if not chunk:
            break

        # Create a dictionary to represent the multipart form data
        files = {
            "file": ("audio.mp3", chunk, "audio/mp3")
        }

        # Specify the model to use for transcription
        payload = {
            "model": "whisper-1"
        }

        # Send the multipart form request to the API
        response = requests.post(endpoint, headers=headers, data=payload, files=files)
        print(response)
        # Append response to the list
        all_responses.append(response.json())

    # Concatenate all responses
    for resp in all_responses:
        concatenated_response += resp.get("text", "") + " "

    return jsonify({'transcript': concatenated_response})



@app.route('/extract_audio', methods=['POST'])
def extract_audio():
    # Check if a file was uploaded
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    # Get the video file from the request
    video_file = request.files['file']

    # Check if the file is empty
    if video_file.filename == '':
        return jsonify({'error': 'Empty file provided'}), 400

    # Check if the file is allowed
    allowed_extensions = {'mp4', 'avi', 'mov', 'mkv'}
    if '.' not in video_file.filename or video_file.filename.split('.')[-1].lower() not in allowed_extensions:
        return jsonify({'error': 'Unsupported file format'}), 400

    # Define the directory where the temporary file should be saved
    temp_directory = 'tmp'
    
    # Check if the directory exists, if not create it
    if not os.path.exists(temp_directory):
        os.makedirs(temp_directory)

    # Save the video file to a temporary location
    video_path = os.path.join(temp_directory, 'video_input.' + video_file.filename.split('.')[-1])
    video_file.save(video_path)

    # Extract audio from the video
    audio_clip = mp.VideoFileClip(video_path).audio

    # Define the output path for the MP3 file
    mp3_output_path = os.path.join(temp_directory, 'audio_output.mp3')

    # Write the audio to an MP3 file
    audio_clip.write_audiofile(mp3_output_path)
    os.remove(video_path)
    
    # Check if the file was written successfully
    if os.path.exists(mp3_output_path):
        return jsonify({'mp3_file': mp3_output_path}), 200
    else:
        return jsonify({'error': 'Failed to write audio file'}), 500


@app.route('/transcribe_video', methods=['POST'])
def transcribe_video():
    # Define the API endpoint
    endpoint = "https://api.openai.com/v1/audio/transcriptions"

    # Define the headers with your API key
    headers = {
        "Authorization": "Bearer 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"
    }

    # Define chunk size (adjust as needed)
    chunk_size = 4096 * 4096  # 1 MB chunk size

    # Get the audio file from the request
    video_file = request.files['video']
    
    audio_file_path = extract_audio_from_video(video_file)
    
    print(audio_file_path)
    if 'error' in audio_file_path:
        return jsonify(audio_file_path), 400
    
    mp3_file_path = audio_file_path['mp3_file']

    # Initialize an empty list to store responses
    all_responses = []

    # Initialize concatenated response string
    concatenated_response = ""

    # Read the audio file in chunks and send API calls for each chunk
    with open(mp3_file_path, 'rb') as audio_file:
        while True:
            chunk = audio_file.read(chunk_size)
            if not chunk:
                break

            # Create a dictionary to represent the multipart form data
            files = {
                "file": ("audio.mp3", chunk, "audio/mp3")
            }

            # Specify the model to use for transcription
            payload = {
                "model": "whisper-1"
            }

            # Send the multipart form request to the API
            response = requests.post(endpoint, headers=headers, data=payload, files=files)
            print(response)
            # Append response to the list
            all_responses.append(response.json())

    # Concatenate all responses
    for resp in all_responses:
        concatenated_response += resp.get("text", "") + " "

    return jsonify({'transcript': concatenated_response})

def extract_audio_from_video(video_file):
    # Use system's temporary directory if no output directory is specified
    # Check if the file is empty
    if video_file.filename == '':
        return {'error': 'Empty file provided'}

    # Check if the file is allowed
    allowed_extensions = {'mp4', 'avi', 'mov', 'mkv'}
    if '.' not in video_file.filename or video_file.filename.split('.')[-1].lower() not in allowed_extensions:
        return {'error': 'Unsupported file format'}

    # Save the video file to a temporary location
    temp_directory = 'tmp'
    if not os.path.exists(temp_directory):
        os.makedirs(temp_directory)

    # Save the video file to a temporary location
    video_path = os.path.join(temp_directory, 'video_input.' + video_file.filename.split('.')[-1])
    video_file.save(video_path)

    # Extract audio from the video
    audio_clip = mp.VideoFileClip(video_path).audio

    # Define the output path for the MP3 file
    mp3_output_path = os.path.join(temp_directory, 'audio_output.mp3')

    # Write the audio to an MP3 file
    audio_clip.write_audiofile(mp3_output_path)
    os.remove(video_path)
    
    # Check if the file was written successfully
    if os.path.exists(mp3_output_path):
        return {'mp3_file': mp3_output_path}
    else:
        return {'error': 'Failed to write audio file'}


    
@app.route('/summarize', methods=['POST'])
def summarize_text():
    # Get the transcript from the request
    transcript = request.json.get('transcript', '')

    # Use the new API to generate a summary
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "I have recently attended this meeting but was not concentrated enough. Here is the meeting transcript. Please help me by generating a meeting report with key points. Only provide the report and nothing else."},
            {"role": "user", "content": transcript}  # Use the user-provided transcript
        ]
    )
    print("==============================")
    print(completion)
    print("===================================")
    content = completion.choices[0].message.content
    print(content)
    print("==============================")
    # Extract the content of the chat completion message
    summary_text = content

    # Return the summarized text as JSON response
    return jsonify({'summary': content})

@app.route('/summarize_as_class_notes', methods=['POST'])
def summarize_text_as_class_notes():
    # Get the transcript from the request
    transcript = request.json.get('transcript', '')

    # Use the new API to generate a summary
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "I have recently attended this meeting but was not concentrated enough. Here is the meeting transcript. Please help me by generating with key points as class notes"},
            {"role": "user", "content": transcript}  # Use the user-provided transcript
        ]
    )
    print("==============================")
    print(completion)
    print("===================================")
    content = completion.choices[0].message.content
    print(content)
    print("==============================")
    # Extract the content of the chat completion message
    summary_text = content

    # Return the summarized text as JSON response
    return jsonify({'summary': content})

@app.route('/summarize_as_scrum_meeting_minutes', methods=['POST'])
def scrum_meeting_minutes():
    # Get the transcript from the request
    transcript = request.json.get('transcript', '')

    # Use the new API to generate a summary
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "I have recently attended this meeting but was not concentrated enough. Here is the meeting transcript. Please help me with key points as scrum meeting minutes"},
            {"role": "user", "content": transcript}  # Use the user-provided transcript
        ]
    )
    print("==============================")
    print(completion)
    print("===================================")
    content = completion.choices[0].message.content
    print(content)
    print("==============================")
    # Extract the content of the chat completion message
    summary_text = content

    # Return the summarized text as JSON response
    return jsonify({'summary': content})

@app.route('/summarize_txt', methods=['POST'])
def summarize_txt():
    # Get the transcript from the request
    transcript = request.json.get('transcript', '')

    # Use the new API to generate a summary
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "I have recently attended this meeting but was not concentrated enough. Here is the meeting transcript. Please help me with key points"},
            {"role": "user", "content": transcript}  # Use the user-provided transcript
        ]
    )

    # Extract the content of the chat completion message
    content = completion.choices[0].message.content

    # Save the summarized text to a temporary text file
    output_file = 'summary.txt'
    with open(output_file, 'w') as file:
        file.write(content)

    # Return the text file as a response
    return send_file(output_file, as_attachment=True)

@app.route('/send_mail', methods=['POST'])
def send_mail():
    data = request.get_json()
    summary = data.get('summary', '')

    # Create a Message object
    msg = Message('Meeting Summary!',
                  sender='briefcast@proton.me',
                  recipients=['kabidhasan34@gmail.com', 'mugdhasamiul@gmail.com', 'reefat.raha2018@gmail.com'])

    # Set the body of the email
    msg.body = summary

    # Create a BytesIO object to hold the in-memory file
    output_file = BytesIO()

    # Write the summary content to the in-memory file
    output_file.write(summary.encode())

    # Seek to the beginning of the file
    output_file.seek(0)

    # Attach the in-memory file as a text file
    msg.attach("summary.txt", "text/plain", output_file.getvalue())

    # Send the email
    mail.send(msg)

    return 'Email sent!'
if __name__ == '__main__':
    app.run(debug=True)
    

#xsmtpsib-54493d8c981e94eaf6a01908af41fed959ee809dec8f81d87dd05e0e01be258b-azTpgdkV689rbqU3
