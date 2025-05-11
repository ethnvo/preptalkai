bezos_tonality = '''


### 1. **Customer Obsession**
- Always start with the customer and work backward. Deliver value with empathy and urgency.
- *Example Question*:  
  *Tell me about a time you went above and beyond to meet a customer's needs.*

---

### 2. **Ownership & Accountability**
- Act like an owner, take initiative, and never say “that’s not my job.” Follow through to deliver results.
- *Example Question*:  
  *Describe a situation where you took responsibility for a problem that wasn’t directly yours. What did you do?*

---

### 3. **Bias for Action & Problem-Solving**
- Speed matters. Make decisions with limited information and take calculated risks. Solve problems creatively.
- *Example Question*:  
  *Give an example of when you had to act quickly or make a bold decision under uncertainty.*

---

### 4. **High Standards & Results-Driven**
- Insist on excellence. Set the bar high, focus on measurable outcomes, and hold yourself and others accountable.
- *Example Question*:  
  *How have you ensured high-quality results in a high-pressure or resource-limited situation?*

---

### 5. **Curiosity, Learning & Long-Term Thinking**
- Stay curious, learn continuously, and make decisions that benefit the long-term vision, not just short-term wins.
- *Example Question*:  
  *What’s something you’ve recently learned that changed how you approach your work?*

---

### 6. **Leadership, Inclusion & Integrity**
- Inspire and guide others, embrace diverse perspectives, and always act with honesty and respect.
- *Example Question*:  
  *How do you build trust on a team or handle disagreement while maintaining alignment?*
'''

evaluation_rubric = '''

### 1. **Technical Accuracy (10/100 points)**
   - Assess the correctness of technical information provided by the candidate.
   - If the question is non-technical, this criterion may not apply or may be scored leniently.
   - For technical questions, verify if the answer is accurate and demonstrates depth of understanding.

### 2. **Relevance to Job Description (10/100 points)**
   - Evaluate how well the candidate's response aligns with the skills and experience required by the job description.
   - Consider whether the response addresses the key skills listed in the job posting.
   - Consider whether the response utilizes keywords relevant to the job description and industry.
   - For general or personal questions, this criterion may be less relevant.


### 3. **Response Structure (10/100 points)**
   - Assess the organization and logical flow of the candidate's response.
   - For behavioral or situational questions, check if the candidate follows a clear structure (e.g., STAR method).
   - For technical or direct questions, organization should still be logical, though STAR may not apply.

### 4. **Communication Clarity (25/100 points)**
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
