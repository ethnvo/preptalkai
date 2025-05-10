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
   ```

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
