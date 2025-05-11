import boto3
import base64
import uuid
import time
import os
import requests

region = 'us-west-2'
bucket_name = "awspeak-backend-bucket"

def audio_to_text(audio_base64):

    audio_binary = base64.b64decode(audio_base64.encode("utf-8"))
    audio_filename = f"audio-{uuid.uuid4()}.mp3"

    with open(audio_filename, 'wb') as f:
        f.write(audio_binary)

    s3 = boto3.client('s3', region_name=region)
    s3.upload_file(audio_filename, bucket_name, audio_filename)

    transcribe = boto3.client('transcribe', region_name=region)
    job_name = f"transcribe-job-{uuid.uuid4()}"
    media_uri = f"s3://{bucket_name}/{audio_filename}"

    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': media_uri},
        MediaFormat='mp3',
        LanguageCode='en-US'
    )

    while True:
        result = transcribe.get_transcription_job(TranscriptionJobName=job_name)
        status = result['TranscriptionJob']['TranscriptionJobStatus']
        if status in ['COMPLETED', 'FAILED']:
            break
        time.sleep(5)

    os.remove(audio_filename)

    if status == 'COMPLETED':
        transcript_file_url = result['TranscriptionJob']['Transcript']['TranscriptFileUri']
        transcript_response = requests.get(transcript_file_url)
        transcript_json = transcript_response.json()
        transcript_text = transcript_json['results']['transcripts'][0]['transcript']
        return transcript_text
    else:
        raise Exception("Transcription job failed")
    
def test_transcribe():
    with open("backend/test_audio_output.mp3", "rb") as audio_file:
        audio_base64 = base64.b64encode(audio_file.read()).decode("utf-8")

    transcription = audio_to_text(audio_base64)
    print(transcription)


def main():
    test_transcribe()
    
if __name__ == "__main__":
    main()