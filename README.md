
# PrepTalk.ai – Frontend

This is the frontend for **PrepTalk.ai**, an AI-powered interview prep tool that simulates behavioral interviews using personas like Jeff Bezos. Built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🛠 Setup Instructions

1. **Install dependencies**  
   From the `frontend/` directory, run:
   ```bash
   npm install

2. **Run the development server**

   ```bash
   npm run dev
   ```

3. Open your browser at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── app/              # App router pages
├── components/       # Reusable UI components
├── public/           # Static assets
├── styles/           # Tailwind/global CSS
├── tsconfig.json     # TypeScript config
└── package.json      # Project dependencies
```

## 🧠 About

PrepTalk.ai helps users practice high-stakes interviews using AI-generated scenarios and feedback. This frontend connects to the backend API (Flask + AWS) and handles user interaction.

---

# PrepTalk.ai – Backend

This is the backend for **PrepTalk.ai**, a Flask-based API that powers the AI interview simulator.

## 🔧 Tech Stack

* Python 3
* Flask
* (Future) AWS SDK (e.g. Boto3 or AWS Lambda)

## 🚀 Setup Instructions

1. **Install dependencies**
   From the `backend/` directory, run:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Flask server**

   ```bash
   python app.py
   ```

3. The API will be available at:

   ```
   http://localhost:5000
   ```

## 🧪 Example Endpoint

### `POST /api/generate-question`

Returns a sample interview question and persona.

**Example Response**:

```json
{
  "question": "Describe a time you took initiative.",
  "persona": "Jeff Bezos"
}
```

## 📁 Project Structure

```
backend/
├── app.py              # Flask app entrypoint
├── requirements.txt    # Python dependencies
```
