from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/start', methods=['POST'])
def start():
    data = request.get_json()
    job_description = data.get('jobDescription', '')
    print('Received job description:', job_description)
    
    # Process or respond with something
    return jsonify({'message': 'Received!', 'summary': job_description[:100]})
