'use client'; // needed for client-side interactivity

import { useState } from 'react';

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');

  const handleStart = () => {
    console.log('Job Description:', jobDescription);
    // You can route or send the data to your backend here
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">MockTalkAI</h1>
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Input Job Description
        </h1>
        <textarea
          className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[150px]"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste or type the job description here..."
        />
        <button
          onClick={handleStart}
          className="mt-6 w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
        >
          Start Conversation
        </button>
      </div>
    </main>
  );
}
