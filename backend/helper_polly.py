from flask import Flask, jsonify
from flask_cors import CORS
import boto3
import base64
import os

app = Flask(__name__)
CORS(app)

def text_to_audio(text, boto3_session=None):
    if boto3_session is None:
        boto3_session = boto3.Session(profile_name="preptalk-ai")

    polly = boto3_session.client('polly', region_name='us-west-2')

    response = polly.synthesize_speech(
        Text = text,
        OutputFormat = "mp3",
        VoiceId= "Ayanda",
        Engine = "neural"
    )

    audio_stream = response['AudioStream'].read()
    audio_base64 = base64.b64encode(audio_stream).decode('utf-8')


    return audio_base64


#Testing audio
def test_audio():

    test_text = "Ethan vo is a professional presser"

    audio_base64 = text_to_audio(test_text)

    audio_data = base64.b64decode(audio_base64)

    output_filename = "test_audio_output.mp3"
    output_path = os.path.join(os.getcwd(), output_filename)

    try:
        with open(output_path, 'wb') as audio_file:
            audio_file.write(audio_data)
        print(f"Audio has been saved as {output_filename} in the current directory.")
    
    except Exception as e:
        print(f"Error saving audio: {e}")
        
def main():
    test_audio()

if __name__ == "__main__":
    main()







