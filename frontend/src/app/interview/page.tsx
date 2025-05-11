'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const InterviewPage: React.FC = () => {
  const router = useRouter();
  const [questions, setQuestions] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [responses, setResponses] = useState<{[key: number]: string}>({});
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [interviewComplete, setInterviewComplete] = useState<boolean>(false);
  const [audioData, setAudioData] = useState<{[key: number]: string}>({});
  const [loading, setLoading] = useState<boolean>(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedQuestions = localStorage.getItem('interviewQuestions');
      const storedJobTitle = localStorage.getItem('jobTitle');
      
      if (storedQuestions) {
        try {
          const parsedQuestions = JSON.parse(storedQuestions);
          setQuestions(parsedQuestions);
        } catch (error) {
          console.error('Error parsing stored questions:', error);
        }
      }
      
      if (storedJobTitle) {
        setJobTitle(storedJobTitle);
      }
      
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            console.log('Microphone permission granted');
          })
          .catch(error => {
            console.error('Error accessing microphone:', error);
            alert('Please allow microphone access to use this feature');
          });
      }
    }
    
    setLoading(false);
      
    return () => {
      stopRecording();
    };
  }, []);
  
  const startRecording = async () => {
    audioChunksRef.current = [];
    
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      alert('Audio recording is not supported in this browser');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioData(prev => ({
          ...prev,
          [currentQuestionIndex]: audioUrl
        }));
        
        simulateTranscription(currentQuestionIndex);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
      console.log('Recording started...');
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check your microphone permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      console.log('Recording stopped.');
    }
  };
  
  const simulateTranscription = (questionIndex: number) => {
    const sampleResponses = [
      "I led a project to optimize our company's data processing pipeline. The existing system was slow and unreliable, so I researched and implemented a new approach using distributed computing with Apache Spark. This reduced processing time by 85% and significantly improved reliability. I coordinated with multiple teams during implementation and ensured a smooth transition.",
      "I approach decisions by carefully analyzing both short-term impacts and long-term strategic goals. For example, when deciding on a new technology stack for our platform, I evaluated immediate development costs and team expertise, but also considered future scalability and maintenance requirements. We chose a slightly more expensive solution initially, but it has saved us significant resources over time.",
      "I led a cross-functional team through a complex product launch under a tight deadline. I created a detailed project plan with clear milestones, held daily standups, and implemented a transparent issue tracking system. When we encountered supply chain obstacles, I proactively developed alternative solutions and reallocated resources to maintain our timeline. The product launched successfully on time.",
      "When developing our user authentication system, I advocated for implementing biometric authentication despite the additional complexity. I analyzed security risks, user experience benefits, and competitive landscape before proposing this approach. I mitigated risks by thoroughly testing edge cases and creating detailed fallback mechanisms. The feature significantly improved our security posture while enhancing user satisfaction.",
      "I always start by directly engaging with customers through interviews and usability testing. In our recent platform redesign, I organized sessions with key users to understand their workflows and pain points. This led to us completely rethinking our navigation structure. Rather than following industry trends, we prioritized the specific needs of our users, resulting in a 40% increase in user engagement."
    ];
    
    const transcription = sampleResponses[questionIndex % sampleResponses.length];
    
    setResponses(prev => ({
      ...prev,
      [questionIndex]: transcription
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setInterviewComplete(true);
      setShowTranscript(true);
    }
  };
  
  const handleFinishInterview = () => {
    setInterviewComplete(true);
    setShowTranscript(true);
  };
  
  const handleReturnHome = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('interviewQuestions');
      localStorage.removeItem('jobTitle');
    }
    
    router.push('/');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-6">No Interview Questions Found</h1>
        <p className="text-gray-300 mb-8">There was an error loading the interview questions.</p>
        <button 
          onClick={handleReturnHome}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-blue-500">AWSpeakAI</h1>
            </div>
            <div>
              <button
                onClick={handleReturnHome}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition"
              >
                Exit Interview
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {!showTranscript ? (
            // Interview in progress
            <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Interview for {jobTitle} Position
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                  </div>
                  {!interviewComplete && (
                    <button 
                      onClick={handleFinishInterview}
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition"
                    >
                      Finish Early
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-8">
                {/* Jeff Bezos Image and Info */}
                <div className="flex flex-col sm:flex-row items-center mb-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="w-32 h-32 rounded-full bg-blue-900/50 mb-4 sm:mb-0 sm:mr-6 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img 
                      src="/api/placeholder/128/128" 
                      alt="Jeff Bezos"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Jeff Bezos</h3>
                    <p className="text-gray-300 mb-4">Interviewer - CEO, Amazon</p>
                    <p className="text-gray-400 text-sm">
                      Jeff is known for his focus on innovation, customer obsession, and long-term thinking.
                      Answer his questions thoroughly, showcasing your problem-solving skills and leadership abilities.
                    </p>
                  </div>
                </div>
                
                {/* Question from Jeff */}
                <div className="flex items-start space-x-4 mb-8">
                  <div className="h-12 w-12 bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex-grow">
                    <p className="text-gray-200 font-medium">
                      {questions[currentQuestionIndex]}
                    </p>
                  </div>
                </div>
                
                {/* Recording Interface */}
                <div className="mb-8">
                  <div className="flex flex-col items-center space-y-6">
                    {isRecording ? (
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center mb-3 animate-pulse">
                          <span className="text-4xl">🎙️</span>
                        </div>
                        <p className="text-red-400 font-medium mb-2">Recording in progress...</p>
                        <p className="text-gray-400 text-sm mb-6">Speak clearly into your microphone</p>
                        <button
                          onClick={stopRecording}
                          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center"
                        >
                          <span className="mr-2">⏹️</span>
                          Stop Recording
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        {responses[currentQuestionIndex] ? (
                          <div className="w-24 h-24 rounded-full bg-green-600/20 flex items-center justify-center mb-3">
                            <span className="text-4xl">✓</span>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-3">
                            <span className="text-4xl">🎙️</span>
                          </div>
                        )}
                        <p className="text-gray-200 font-medium mb-2">
                          {responses[currentQuestionIndex] 
                            ? "Response recorded!" 
                            : "Ready to record your answer"}
                        </p>
                        <p className="text-gray-400 text-sm mb-6">
                          {responses[currentQuestionIndex]
                            ? "You can proceed to the next question or re-record your answer"
                            : "Click the button below to start speaking"}
                        </p>
                        <button
                          onClick={startRecording}
                          className={`px-8 py-3 ${
                            responses[currentQuestionIndex]
                              ? "bg-gray-700 hover:bg-gray-600"
                              : "bg-green-600 hover:bg-green-700"
                          } text-white font-medium rounded-lg transition flex items-center`}
                        >
                          <span className="mr-2">⏺️</span>
                          {responses[currentQuestionIndex] ? "Record Again" : "Start Recording"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between mt-12">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-3 rounded-lg font-medium transition flex items-center ${
                      currentQuestionIndex === 0
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    }`}
                  >
                    <span className="mr-2">←</span>
                    Previous
                  </button>
                  
                  <button
                    onClick={handleNextQuestion}
                    disabled={!responses[currentQuestionIndex]}
                    className={`px-6 py-3 font-medium rounded-lg transition flex items-center ${
                      !responses[currentQuestionIndex]
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        Next
                        <span className="ml-2">→</span>
                      </>
                    ) : (
                      'Complete Interview'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Interview transcript (shown at the end)
            <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800 animate-fadeIn">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-2xl font-bold text-white">
                  Interview Completed
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {jobTitle} Position - Transcript
                </p>
              </div>
              
              <div className="p-8">
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600/20 mb-4">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Great job!</h3>
                  <p className="text-gray-400 mt-2">
                    You've completed your interview with Jeff Bezos. Here's a transcript of your responses.
                  </p>
                </div>
                
                <div className="space-y-8 mt-10">
                  {questions.map((question, index) => (
                    <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                      <div className="flex items-start space-x-4 mb-6">
                        <div className="h-10 w-10 bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">Q</span>
                        </div>
                        <p className="text-gray-200 font-medium pt-1.5">
                          {question}
                        </p>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="h-10 w-10 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">A</span>
                        </div>
                        <div className="pt-1.5 flex-grow">
                          <p className="text-gray-300">
                            {responses[index] || "No response recorded"}
                          </p>
                          
                          {/* Audio playback if available */}
                          {audioData[index] && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-400 mb-2">Listen to your response:</p>
                              <audio controls src={audioData[index]} className="w-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleReturnHome}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                  >
                    Return to Home
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center"
                  >
                    <span className="mr-2">📄</span>
                    Save Transcript
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InterviewPage;