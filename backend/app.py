# backend/app.py
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/api/generate-question", methods=["POST"])
def generate_question():
    return jsonify({
        "question": "Describe a time you took initiative.",
        "persona": "Jeff Bezos"
    })

if __name__ == "__main__":
    app.run(debug=True)
