import boto3
import base64
import uuid
import time
import os
import requests

region = 'us-west-2'
bucket_name = "awspeak-backend-bucket"
profile_name = "preptalk-ai"

session = boto3.Session(profile_name=profile_name)
s3 = session.client('s3', region_name=region)
transcribe = session.client('transcribe', region_name=region)

def audio_to_text(audio_base64, boto3_session=None):
    if boto3_session is None:
        boto3_session = boto3.Session(profile_name="preptalk-ai")

    s3 = boto3_session.client('s3', region_name=region)
    transcribe = boto3_session.client('transcribe', region_name=region)

    audio_binary = base64.b64decode(audio_base64.encode("utf-8"))
    audio_filename = f"audio-{uuid.uuid4()}.mp3"

    with open(audio_filename, 'wb') as f:
        f.write(audio_binary)

    s3.upload_file(
        audio_filename, bucket_name, audio_filename,
        ExtraArgs={'ContentType': 'audio/mpeg'}
    )

    job_name = f"transcribe-job-{uuid.uuid4()}"
    media_uri = f"s3://{bucket_name}/{audio_filename}"

    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={'MediaFileUri': media_uri},
        MediaFormat='mp3',
        LanguageCode='en-US'
    )

    max_wait = 60
    waited = 0
    while waited < max_wait:
        result = transcribe.get_transcription_job(TranscriptionJobName=job_name)
        status = result['TranscriptionJob']['TranscriptionJobStatus']
        if status in ['COMPLETED', 'FAILED']:
            break
        time.sleep(5)
        waited += 5

    os.remove(audio_filename)

    if status == 'COMPLETED':
        transcript_file_url = result['TranscriptionJob']['Transcript']['TranscriptFileUri']
        transcript_response = requests.get(transcript_file_url)
        transcript_json = transcript_response.json()
        transcript_text = transcript_json['results']['transcripts'][0]['transcript']

        transcribe.delete_transcription_job(TranscriptionJobName=job_name)

        return transcript_text
    else:
        raise Exception("Transcription job failed or timed out")


# Optional test runner
def test_transcribe():
    session = boto3.Session(profile_name="preptalk-ai")
    with open("test_audio_output.mp3", "rb") as audio_file:
        audio_base64 = base64.b64encode(audio_file.read()).decode("utf-8")

    transcription = audio_to_text(audio_base64, boto3_session=session)
    print("📝 Transcription:", transcription)

if __name__ == "__main__":
    test_transcribe()
