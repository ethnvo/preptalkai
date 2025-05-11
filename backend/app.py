from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import boto3
import helper_polly
import helper_transcribe
from concurrent.futures import ThreadPoolExecutor
import prompts

transcriptQA = {
    "questions": [],
    "answers": []
}



app = Flask(__name__)
CORS(app)

bezos_tonality = prompts.bezos_tonality

session = boto3.Session(profile_name="preptalk-ai")

bedrock_client = session.client(
    service_name="bedrock-runtime",
    region_name="us-west-2"
)

modelID = "arn:aws:bedrock:us-west-2:381491848551:inference-profile/us.anthropic.claude-3-7-sonnet-20250219-v1:0"

@app.route('/api/start', methods=['POST'])
def start():
    
    #We need to reset the transcriptQA dictionary
    global transcriptQA
    transcriptQA = {
      "questions": [],
      "answers": []
    }  


    data = request.get_json()
    job_description = data.get('jobDescription', '')

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": [
            {
                "role": "user",
                "content": f'''

                You are the worlds best HR professional, known for your insightful interview questions and you are interviewing a potential employee for this job:
                {job_description}

                This candidate is not necessarily applying for a technical or computer science-related role. They could come from any professional background such as operations, marketing, design, healthcare, or business.

                Your role is to ask insightful, high-impact interview questions that test a candidate’s fit based on their behavior, leadership, problem-solving, vision, and adaptability—without relying on role-specific technical jargon.

                Only include technical-related questions if they are clearly relevant to the position. Otherwise, focus on evaluating the candidate’s leadership qualities, problem-solving, long-term thinking, and ownership—principles that apply across all professions.
                
                Here are some guidelines about the tonalities, behaviors, and company philosophies you should base your questions on:

                {bezos_tonality}

                Please generate five thoughtful, high-impact interview questions that reflect on your company's philosophy and are tailored to the job description.
                
                Respond with a JSON object with the following format:

                {{
                    "questions": [
                        "Question 1",
                        "Question 2",
                        "Question 3",
                        "Question 4",
                        "Question 5"
                    ]
                }}
                '''
            }
        ],
        "max_tokens": 500,
        "temperature": 0.5
    }

    response = bedrock_client.invoke_model(
        modelId=modelID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json"
    )

    response_body = json.loads(response['body'].read())
   #print("Raw Bedrock response:", response_body)

    claude_blocks = response_body.get("message") or response_body.get("content")
    if not claude_blocks:
        return jsonify({"error": "Claude response missing 'message' or 'content'"}), 500

    claude_text = claude_blocks[0].get("text", "").strip()
    clean_json_str = (
        claude_text
        .removeprefix("```json")
        .removesuffix("```")
        .strip()
    )

    try:
        parsed = json.loads(clean_json_str)
        questions = parsed.get("questions", [])

        transcriptQA["questions"] = questions

        # Use Polly to generate audio for each question
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_index = {
                executor.submit(helper_polly.text_to_audio, q, session): i
                for i, q in enumerate(questions[:5])
            }

            results = {}
            for future in future_to_index:
                i = future_to_index[future]
                try:
                    audio = future.result()
                    results[f"question{i+1}"] = {
                        "text": questions[i],
                        "audio": audio
                    }
                except Exception as e:
                    results[f"question{i+1}"] = {
                        "text": questions[i],
                        "audio": "",
                        "error": str(e)
                    }

        return jsonify(results)

    except Exception as e:
        print("Parsing error:", e)
        return jsonify({"error": "Could not parse Claude's response"}), 500

@app.route('/api/transcribe', methods=['POST'])
def transcribe():
    data = request.get_json()
    audio_base64 = data.get("audio", "")
    if not audio_base64:
        return jsonify({"error": "Missing 'audio' in request"}), 400

    try:
        text = helper_transcribe.audio_to_text(audio_base64)

        transcriptQA["answers"].append(text)

        return jsonify({"transcript": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route('/api/evaluate', methods=['GET'])
def evaluate():
    global transcriptQA

    if not transcriptQA["questions"] or not transcriptQA["answers"]:
        return jsonify({"error": "Transcript data is incomplete"}), 400

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": [
            {
                "role": "user",
                "content": f'''

                    You are a professional interview evaluator. Your task is to review a candidate's interview transcript and assess their performance based on the provided evaluation rubric.

                    You will receive two inputs:
                    1. **Interview Transcript Questions** — This includes the questions asked by the interviewer in order.
                    2. **Interview Transcript Answers** — This includes the answers given by the candidate in order.
                    3. **Evaluation Rubric** — A detailed breakdown of the criteria used to score the interview.
                    4. **Response Format** — The format of the response you will give.

                    Here are the transcript questions: {transcriptQA["questions"]}

                    Here are the transcript answers: {transcriptQA["answers"]}

                    Here is the evaluation rubric: {prompts.evaluation_rubric}

                    Here is the response format: {prompts.evaluation_response_format}

                    Reply with only the JSON object in the response format.
    
                '''
            }
        ],
        "max_tokens": 1000,
        "temperature": 0.8
    }

    response = bedrock_client.invoke_model(
        modelId=modelID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json"
    )

    response_body = json.loads(response['body'].read())

    claude_blocks = response_body.get("message") or response_body.get("content")
    if not claude_blocks:
        return jsonify({"error": "Claude response missing 'message' or 'content'"}), 500

    claude_text = claude_blocks[0].get("text", "").strip()
    clean_json_str = (
        claude_text
        .removeprefix("```json")
        .removesuffix("```")
        .strip()
    )

    try:
        parsed = json.loads(clean_json_str)
        total_score = parsed.get("total_score", "N/A")
        feedback_list = parsed.get("feedback", [])

        evaluation_result = {
          "total_score": total_score,
          "feedback": feedback_list,
          "transcript_questions": transcriptQA["questions"],
          "transcript_answers": transcriptQA["answers"]
        }

        return jsonify(evaluation_result)
    
    except Exception as e:
        print("Evaluation parsing error:", e)
        return jsonify({"error": "Could not parse Claude's evaluation output"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5050)
