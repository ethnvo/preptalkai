import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-6 text-gray-800">MockTalkAI</h1>
      <textarea
        className="w-full max-w-md p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        rows={6}
        placeholder="Type your message here..."
      />
    </main>
    
  );
}
