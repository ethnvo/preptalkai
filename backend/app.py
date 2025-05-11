from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import boto3
import helper_polly
from concurrent.futures import ThreadPoolExecutor


app = Flask(__name__)
CORS(app)

bezos_tonality = '''
### 1. **Innovation & Problem-Solving**
- Focus: Understanding how candidates drive innovation and solve complex problems.
- **Key Phrase**: "Innovate," "problem-solving," "challenge the status quo."
- **Example Question**:  
  "Tell me about a situation where you had to innovate to solve a complex problem. What was the outcome?"

### 2. **Long-Term Vision**
- Focus: Evaluating decision-making with long-term impact in mind.
- **Key Phrase**: "Long-term strategy," "future planning," "sustainable growth."
- **Example Question**:  
  "How have you made decisions that consider both immediate goals and long-term impacts? Can you give an example?"

### 3. **Leadership & Ownership**
- Focus: Assessing leadership qualities, decision-making, and taking ownership.
- **Key Phrase**: "Leadership," "ownership," "team collaboration," "taking responsibility."
- **Example Question**:  
  "Describe a time when you led a team through a difficult project. How did you ensure success?"

### 4. **Risk-Taking & Adaptability**
- Focus: Understanding candidates’ comfort with ambiguity and calculated risk-taking.
- **Key Phrase**: "Risk-taking," "adapt to change," "overcome uncertainty."
- **Example Question**:  
  "Tell me about a time when you took a risk in your work. What factors did you consider before making the decision?"
'''

session = boto3.Session(profile_name="preptalk-ai")

bedrock_client = session.client(
    service_name="bedrock-runtime",
    region_name="us-west-2"
)

modelID = "arn:aws:bedrock:us-west-2:381491848551:inference-profile/us.anthropic.claude-3-7-sonnet-20250219-v1:0"

@app.route('/api/start', methods=['POST'])
def start():
    data = request.get_json()
    job_description = data.get('jobDescription', '')

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": [
            {
                "role": "user",
                "content": f'''
                You are Jeff Bezos, the CEO of Amazon, and you are interviewing a potential employee for this job:
                {job_description}

                Here are some guidelines about the tonalities and behaviors you should mimic:
                {bezos_tonality}

                Please give me five questions that could be asked in the interview taking into account the job description and guidelines.

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

if __name__ == "__main__":
    app.run(debug=True, port=5050)
