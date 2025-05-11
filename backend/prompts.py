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

evaluation_rubric = '''

### 1. **Technical Accuracy (10 points)**
   - Assess the correctness of technical information provided by the candidate.
   - If the question is non-technical, this criterion may not apply or may be scored leniently.
   - For technical questions, verify if the answer is accurate and demonstrates depth of understanding.

### 2. **Relevance to Job Description (10 points)**
   - Evaluate how well the candidate's response aligns with the skills and experience required by the job description.
   - Consider whether the response addresses the key skills listed in the job posting.
   - For general or personal questions, this criterion may be less relevant.

### 3. **Response Structure (10 points)**
   - Assess the organization and logical flow of the candidate's response.
   - For behavioral or situational questions, check if the candidate follows a clear structure (e.g., STAR method).
   - For technical or direct questions, organization should still be logical, though STAR may not apply.

### 4. **Communication Clarity (25 points)**
   - Evaluate the clarity, conciseness, and precision of the candidate's response.
   - Look for avoidance of filler words (e.g., "um," "like") and unnecessary verbosity.
   - Ensure technical depth is appropriate for the target audience; overly technical responses should still be understandable.

### 5. **Problem-Solving Approach (25/100 pts)**
   - Assess the candidate's ability to approach problems analytically and logically.
   - Evaluate how well the candidate considers multiple potential solutions and their impact.
   - This is especially important for situational and behavioral questions.
   - For technical or factual questions, this criterion may not apply.

### 6. **Confidence Level (10/100 pts)**
   - Evaluate the candidate's confidence in their knowledge and their ability to express themselves with authority.
   - Consider how comfortable they are discussing their knowledge gaps.
   - While harder to gauge in text, look for signs of self-assuredness or hesitation.
   - For factual recall or non-opinion-based questions, this may be less important.

### 7. **Specific Examples (10/100 pts)**
   - Assess the relevance, specificity, and impact of examples provided by the candidate.
   - Look for examples that demonstrate the candidate's actual contributions and quantifiable results.
   - For general or hypothetical questions, specific examples may not apply.

---

## Instructions for Contextual Evaluation

For each response, adjust your evaluation based on the nature of the question:

- **Technical Questions**:  
   Focus more on:
   - Technical Accuracy
   - Problem-Solving Approach
   - Communication Clarity  
   *Example:* "How would you optimize the performance of a database query?"

- **Behavioral Questions**:  
   Focus more on:
   - Response Structure (e.g., STAR method)
   - Specific Examples
   - Communication Clarity  
   *Example:* "Tell me about a time when you solved a difficult problem at work."

- **Situational Questions**:  
   Focus more on:
   - Problem-Solving Approach
   - Relevance to Job Description
   - Specific Examples  
   *Example:* "What would you do if you were given a project with tight deadlines and limited resources?"

- **General Questions**:  
   Focus more on:
   - Communication Clarity
   - Relevance to Job Description
   - Response Structure  
   *Example:* "Tell me about yourself."

---

## Grading Considerations

- **Adaptability in Grading**:  
   If the question doesn't provide an opportunity to demonstrate certain rubric points (e.g., "Specific Examples" in a technical question), adjust the grading accordingly without penalizing the candidate for missing those elements.

- **Contextual Understanding**:  
   Ensure you account for the type of question being asked and the natural limitations it might have in covering all areas of the rubric. Some rubric points will not be applicable to all question types.

'''

evaluation_response_format = '''
## RESPONSE FORMATTING

You will return:

1. **Total Score (out of 100)**:  
   This is the sum of all individual rubric scores across the categories. Present this clearly at the top.

2. **Constructive Feedback (Five bullet points, 100 words max each)**:  
   Provide specific, encouraging, and actionable feedback to help the user improve their interview performance. Your tone should be supportive and professional.

   - **What they did well**: Highlight specific strengths in their response. Explain *why* it was effective and the *positive impact* it could have in a real interview setting.
   - **What to improve**: Identify areas for improvement. Describe *why* those areas matter, the *impact* strong performance could have, and provide *practical suggestions* for how to improve (e.g., rephrasing, adding examples, improving structure).
   - Avoid generic praise or criticism. Tailor your feedback to the content of the transcript.
   - Keep the language clear and concise. Avoid over-explaining or repeating rubric categories directly unless relevant to your feedback.

Your goal is to guide the candidate with useful insights that help them feel motivated and better prepared for future interviews.


Please respond with a JSON object in the following format

  {{
      "total_score": “score”,
      "feedback" : [
          "bulletpoint1",
          "bulletpoint2",
          "bulletpoint3",
          "bulletpoint4",
          "bulletpoint5"
      ]
  }}

'''
