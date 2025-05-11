'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const Home: React.FC = () => {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const homeRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const handleStart = async () => {
    if (!jobTitle.trim()) {
      setError('Please enter a job title');
      return;
    }
    
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      console.log('Starting interview with:', {
        jobTitle,
        jobDescription
      });
      
      const response = await fetch('http://localhost:5050/api/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription,
          jobTitle,
          experienceLevel: 'mid',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to start interview: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      localStorage.setItem('interviewQuestionData', JSON.stringify(data));
      
      let parsedQuestions: string[] = [];
      
      try {
        if (data.question1 && data.question1.text) {
          console.log('Found question objects in the response');
          const questionKeys = Object.keys(data).filter(key => key.startsWith('question'));
          parsedQuestions = questionKeys
            .sort()
            .map(key => data[key].text)
            .filter(Boolean);
        } 
        else if (data.questions && Array.isArray(data.questions)) {
          parsedQuestions = data.questions;
        } else if (data.message && typeof data.message === 'string') {
          const jsonMatch = data.message.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            const parsedData = JSON.parse(jsonStr);
            parsedQuestions = parsedData.questions || [];
          }
        } else if (data.message && data.message.questions) {
          parsedQuestions = data.message.questions;
        }
        
        console.log('Parsed questions:', parsedQuestions);
      } catch (e) {
        console.error('Error parsing questions:', e);
        setError('Failed to parse interview questions');
        setIsLoading(false);
        return;
      }
      
      if (parsedQuestions.length === 0) {
        setError('No interview questions were generated. Please try again.');
        setIsLoading(false);
      } else {
        localStorage.setItem('interviewQuestions', JSON.stringify(parsedQuestions));
        localStorage.setItem('jobTitle', jobTitle);
        
        router.push('/interview');
      }
    } catch (err) {
      console.error('Error starting interview:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to interview service');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-500">AWSpeakAI</span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => scrollToSection(homeRef)} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</button>
              <button onClick={() => scrollToSection(featuresRef)} className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Features</button>
            </div>
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                {isMenuOpen ? (
                  <span className="block w-6 h-6 relative">
                    <span className="absolute w-6 h-0.5 bg-current transform rotate-45 top-1/2"></span>
                    <span className="absolute w-6 h-0.5 bg-current transform -rotate-45 top-1/2"></span>
                  </span>
                ) : (
                  <span className="block w-6 h-6 relative">
                    <span className="absolute w-6 h-0.5 bg-current top-1.5"></span>
                    <span className="absolute w-6 h-0.5 bg-current top-3"></span>
                    <span className="absolute w-6 h-0.5 bg-current top-4.5"></span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 px-2 pt-2 pb-3 space-y-1 sm:px-3 absolute w-full z-40">
          <button onClick={() => scrollToSection(homeRef)} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Home</button>
          <button onClick={() => scrollToSection(featuresRef)} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Features</button>
        </div>
      )}

      <section ref={homeRef} className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">Ace Your Next Interview with AI</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              AWSpeak delivers realistic interviews powered by AI, aligned with Amazon’s core values. 
            </p>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Perfect your responses and align with what matters most to the company.
            </p>

            <button onClick={() => scrollToSection(featuresRef)} className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition inline-flex items-center">
              See how it works
              <span className="ml-2">↓</span>
            </button>
          </div>

          <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto border border-gray-800">
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="job-title" className="block text-sm font-medium text-gray-200 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  id="job-title"
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Frontend Developer, Product Manager..."
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="job-description" className="block text-sm font-medium text-gray-200 mb-2">
                  Job Description
                </label>
                <textarea
                  id="job-description"
                  className="w-full p-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[200px]"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste or type the job description here..."
                />
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200">
                  {error}
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center text-gray-400 text-sm mb-4 sm:mb-0">
                  <span className="mr-2 text-sm">🔒</span>
                  <span>All sessions are private and secure</span>
                </div>
                <button
                  onClick={handleStart}
                  disabled={isLoading}
                  className={`w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Preparing...
                    </>
                  ) : (
                    <>
                      Start Interview
                      <span className="ml-2">→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              AWSpeak offers a comprehensive suite of tools to help you prepare for any interview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="h-12 w-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
                <h3 className="text-xl font-bold mb-2">Core Value Alignment</h3>
                <p className="text-gray-400">
                Each question is crafted to reflect the company's core principles, helping you gain insight into what the organization truly values in its team members.
                </p>
               </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="h-12 w-12 bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Personalized Feedback</h3>
              <p className="text-gray-400">Receive detailed feedback on your responses, highlighting strengths and areas for improvement.</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="h-12 w-12 bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Industry-Specific</h3>
              <p className="text-gray-400">Practice with questions tailored to your specific industry, job role, and experience level.</p>
            </div>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="order-2 lg:order-1">
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 h-full">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="text-blue-400 mr-3 text-xl">✓</span>
                      <div>
                        <h4 className="text-lg font-medium text-white">Advanced Answer Analysis</h4>
                        <p className="text-gray-400 mt-1">Our AI provides detailed analysis of your answers, identifying strengths and suggesting improvements.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-400 mr-3 text-xl">✓</span>
                      <div>
                        <h4 className="text-lg font-medium text-white">Keyword Detection</h4>
                        <p className="text-gray-400 mt-1">Our system identifies industry-specific keywords and phrases in your responses, ensuring you speak the language employers expect.</p>
                      </div>
                    </div>
                    {/* <div className="flex items-start">
                      <span className="text-blue-400 mr-3 text-xl">✓</span>
                      <div>
                        <h4 className="text-lg font-medium text-white">Progress Tracking</h4>
                        <p className="text-gray-400 mt-1">Track your improvement over time with detailed performance metrics and progress reports.</p>
                      </div>
                    </div> */}
                    <div className="flex items-start">
                      <span className="text-blue-400 mr-3 text-xl">✓</span>
                      <div>
                        <h4 className="text-lg font-medium text-white">Interview Recording</h4>
                        <p className="text-gray-400 mt-1">Review your practice sessions with full voice transcripts to identify areas for improvement.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold mb-6">Powered by Advanced AI and AWS</h3>
                <p className="text-gray-300 mb-8">
                  Our platform leverages the latest large language models (LLMs) for precise, context-aware interview simulations tailored to your job goals.                </p>
                <p className="text-gray-300 mb-8">
                  Powered by AWS technologies like Bedrock for AI, Polly for voice synthesis, Transcribe for speech recognition, and S3 for secure storage, we offer a seamless, scalable mock interview experience.    </p>
                <p className="text-gray-300 mb-8">
                  Every interaction is assessed with a context-aware, fair rubric, delivering personalized feedback and actionable insights to help you improve faster with each session.
                </p>

              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} AWSpeakAI. All rights reserved.
            </p>
            {/* <div className="mt-4 md:mt-0">
              <select className="bg-gray-800 border border-gray-700 rounded-md text-gray-400 text-sm py-1 px-2">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div> */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;