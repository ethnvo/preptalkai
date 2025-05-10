'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [experience, setExperience] = useState('mid');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  // Refs for scroll navigation
  const homeRef = useRef(null);
  const featuresRef = useRef(null);
  
  const scrollToSection = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const handleStart = () => {
    console.log('Job Description:', jobDescription);
    console.log('Job Title:', jobTitle);
    console.log('Experience Level:', experience);
  };

  const ExperienceLevelSelector = () => (
    <div className="mt-4">
      <label htmlFor="experience-level" className="block text-sm font-medium text-gray-200 mb-2">
        Experience Level
      </label>
      <div className="grid grid-cols-3 gap-2">
        {['junior', 'mid', 'senior'].map((level) => (
          <button
            key={level}
            onClick={() => setExperience(level)}
            className={`py-2 px-3 rounded-md text-sm font-medium transition-all ${
              experience === level
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation */}
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

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 px-2 pt-2 pb-3 space-y-1 sm:px-3 absolute w-full z-40">
          <button onClick={() => scrollToSection(homeRef)} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Home</button>
          <button onClick={() => scrollToSection(featuresRef)} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Features</button>
        </div>
      )}

      {/* Home Section */}
      <section ref={homeRef} className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">Ace Your Next Interview with AI</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              AWSpeakAI provides realistic interview experiences using advanced AI. Perfect your responses and build confidence.
            </p>
            <button onClick={() => scrollToSection(featuresRef)} className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition inline-flex items-center">
              See how it works
              <span className="ml-2">↓</span>
            </button>
          </div>

          {/* Main Interview Tool */}
          <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto border border-gray-800">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex items-center px-6 py-4 text-sm font-medium ${
                  activeTab === 'description'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="mr-2 text-lg font-bold">📄</span>
                Job Description
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`flex items-center px-6 py-4 text-sm font-medium ${
                  activeTab === 'advanced'
                    ? 'border-b-2 border-blue-500 text-blue-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="mr-2 text-lg font-bold">⚙️</span>
                Advanced Options
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'description' ? (
                <>
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
                </>
              ) : (
                <>
                  <ExperienceLevelSelector />

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Interview Focus Areas
                    </label>
                    <div className="space-y-2">
                      {['Technical skills', 'Behavioral questions', 'Company culture fit', 'Problem solving'].map((area) => (
                        <div key={area} className="flex items-center">
                          <input
                            type="checkbox"
                            id={area.replace(/\s+/g, '-').toLowerCase()}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <label htmlFor={area.replace(/\s+/g, '-').toLowerCase()} className="ml-2 text-sm text-gray-300">
                            {area}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Interview Duration
                    </label>
                    <select className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  </div>
                </>
              )}

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center text-gray-400 text-sm mb-4 sm:mb-0">
                  <span className="mr-2 text-sm">🔒</span>
                  <span>All sessions are private and secure</span>
                </div>
                <button
                  onClick={handleStart}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                >
                  Start Interview
                  <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              AWSpeakAI offers a comprehensive suite of tools to help you prepare for any interview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="h-12 w-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Realistic Conversations</h3>
              <p className="text-gray-400">Experience natural, flowing interviews that adapt to your responses just like a real interviewer would.</p>
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

          {/* Additional Features */}
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
                    <div className="flex items-start">
                      <span className="text-blue-400 mr-3 text-xl">✓</span>
                      <div>
                        <h4 className="text-lg font-medium text-white">Progress Tracking</h4>
                        <p className="text-gray-400 mt-1">Track your improvement over time with detailed performance metrics and progress reports.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="text-blue-400 mr-3 text-xl">✓</span>
                      <div>
                        <h4 className="text-lg font-medium text-white">Interview Recording</h4>
                        <p className="text-gray-400 mt-1">Review your practice sessions with full text transcripts to identify areas for improvement.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold mb-6">Powered by Advanced AI</h3>
                <p className="text-gray-300 mb-4">
                  Our AI-driven platform simulates real interview experiences by analyzing thousands of actual interview questions and responses.
                </p>
                <p className="text-gray-300 mb-8">
                  The system learns from your interactions to provide increasingly personalized feedback and guidance, helping you improve with every session.
                </p>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} AWSpeakAI. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <select className="bg-gray-800 border border-gray-700 rounded-md text-gray-400 text-sm py-1 px-2">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
