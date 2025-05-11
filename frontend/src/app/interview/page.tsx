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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [audioReady, setAudioReady] = useState<boolean>(false);
  const [questionPlayed, setQuestionPlayed] = useState<{[key: number]: boolean}>({});
  const [transcript, setTranscript] = useState<string>('');
  const [audioBlobs, setAudioBlobs] = useState<{[key: number]: Blob}>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  useEffect(() => {
    // Load questions and job title from localStorage
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
      
      // Create audio element
      const audio = new Audio();
      audioRef.current = audio;
      audio.onended = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
        
        // Only start countdown if we haven't recorded a response yet and aren't already counting down
        if (!responses[currentQuestionIndex] && countdown === null && !isRecording) {
          startCountdown();
        }
      };
      
      // Fetch question data from localStorage
      try {
        const storedQuestionData = localStorage.getItem('interviewQuestionData');
        if (storedQuestionData) {
          const parsedQuestionData = JSON.parse(storedQuestionData);
          // Extract audio data if available
          const extractedAudioData: {[key: number]: string} = {};
          Object.keys(parsedQuestionData).forEach((key, index) => {
            if (parsedQuestionData[key].audio) {
              extractedAudioData[index] = parsedQuestionData[key].audio;
            }
          });
          
          if (Object.keys(extractedAudioData).length > 0) {
            setAudioData(extractedAudioData);
            setAudioReady(true);
          }
        }
      } catch (error) {
        console.error('Error parsing stored question data:', error);
      }
    }
    
    setLoading(false);
      
    // Clean up function
    return () => {
      stopRecording();
      stopAudioPlayback();
      stopSpeechSynthesis();
      
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error stopping speech recognition:', e);
        }
      }
    };
  }, []);

  const stopAudioPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  const stopSpeechSynthesis = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Set audio as ready when current question changes and auto-play
  useEffect(() => {
    if (questions.length > 0 && !showTranscript) {
      // Reset transcript when changing questions
      setTranscript('');
      
      const hasAudio = audioData[currentQuestionIndex] !== undefined;
      setAudioReady(hasAudio);
      
      // If there's no audio for this question, try to fetch it
      if (!hasAudio) {
        fetchQuestionAudio(currentQuestionIndex).then(() => {
          // Auto-play only if question hasn't been played, no response, and not already playing/recording
          if (!questionPlayed[currentQuestionIndex] && !responses[currentQuestionIndex] && 
              !isPlaying && !isRecording && countdown === null) {
            setTimeout(() => playQuestionAudio(), 500);
          }
        });
      } else if (audioRef.current) {
        audioRef.current.src = audioData[currentQuestionIndex];
        // Auto-play only if question hasn't been played yet, no response, and not already playing/recording
        if (!questionPlayed[currentQuestionIndex] && !responses[currentQuestionIndex] && 
            !isPlaying && !isRecording && countdown === null) {
          setTimeout(() => playQuestionAudio(), 500);
        }
      }
    }
  }, [currentQuestionIndex, questions, audioData, responses, isPlaying, isRecording, countdown, questionPlayed]);
  
  const fetchQuestionAudio = async (questionIndex: number) => {
    // Reset audio states
    setIsPlaying(false);
    setAudioReady(false);
    
    if (!questions[questionIndex]) return;
    
    try {
      // Check if we already have the audio cached
      if (audioData[questionIndex]) {
        if (audioRef.current) {
          audioRef.current.src = audioData[questionIndex];
          setAudioReady(true);
        }
        return;
      }
      
      console.log(`Fetching audio for question ${questionIndex + 1}`);
      
      // Fetch audio from our API
      const response = await fetch('http://localhost:5050/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: questions[questionIndex] })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.audioBase64) {
        console.log(`Audio for question ${questionIndex + 1} is ready`);
        
        // Store the audio data
        setAudioData(prev => ({
          ...prev,
          [questionIndex]: data.audioBase64
        }));
        
        // Set up the audio element
        if (audioRef.current) {
          audioRef.current.src = data.audioBase64;
          audioRef.current.load();
        }
        
        setAudioReady(true);
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.error('Error fetching question audio:', error);
      // Provide fallback using browser's speech synthesis
      setAudioReady(true); // Mark as ready so we can proceed with fallback
    }
  };
  
  const playQuestionAudio = () => {
    if (!audioReady) return;
    
    // Mark this question as played to prevent auto-replay
    setQuestionPlayed(prev => ({
      ...prev,
      [currentQuestionIndex]: true
    }));
    
    setIsPlaying(true);
    
    // Check if we have the audio URL
    if (audioRef.current && audioData[currentQuestionIndex]) {
      // Use the actual audio file
      audioRef.current.src = audioData[currentQuestionIndex];
      audioRef.current.onended = () => {
        setIsPlaying(false);
        
        // Only start countdown if we haven't recorded a response yet
        if (!responses[currentQuestionIndex] && !isRecording) {
          startCountdown();
        }
      };
      
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        fallbackToSpeechSynthesis();
      });
    } else {
      // Fallback to speech synthesis
      fallbackToSpeechSynthesis();
    }
  };
  
  const fallbackToSpeechSynthesis = () => {
    // Use browser's speech synthesis as a fallback
    if ('speechSynthesis' in window && questions[currentQuestionIndex]) {
      console.log('Using speech synthesis fallback');
      const utterance = new SpeechSynthesisUtterance(questions[currentQuestionIndex]);
      synthesisRef.current = utterance;
      
      utterance.onend = () => {
        setIsPlaying(false);
        
        // Only start countdown if we haven't recorded a response yet
        if (!responses[currentQuestionIndex] && !isRecording) {
          startCountdown();
        }
      };
      
      // Stop any current speech
      window.speechSynthesis.cancel();
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
    } else {
      // If speech synthesis is not available, simulate audio playing
      console.log('Speech synthesis not available, simulating audio playback');
      setTimeout(() => {
        setIsPlaying(false);
        
        // Only start countdown if we haven't recorded a response yet
        if (!responses[currentQuestionIndex] && !isRecording) {
          startCountdown();
        }
      }, 3000);
    }
  };
  
  const startCountdown = () => {
    // If we're already in a countdown or recording, don't start another countdown
    if (countdown !== null || isRecording) return;
    
    setCountdown(3);
    
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          // When countdown reaches 0, start recording
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          startRecording();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // New Speech-to-Text implementation
  const startSpeechRecognition = () => {
    // Make TypeScript happy with the webkitSpeechRecognition property
    const windowWithSpeech = window as any;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || 
                              windowWithSpeech.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      return false;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Clear transcript initially
    setTranscript('');
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Display the final or interim transcript
      setTranscript(finalTranscript || interimTranscript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };
    
    try {
      recognition.start();
      recognitionRef.current = recognition;
      console.log('Speech recognition started');
      return recognition;
    } catch (e) {
      console.error('Error starting speech recognition:', e);
      return false;
    }
  };
  
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped');
      } catch (e) {
        console.error('Error stopping speech recognition:', e);
      }
      recognitionRef.current = null;
    }
  };
  
  const startRecording = async () => {
    audioChunksRef.current = [];
    
    // More detailed feature detection
    if (typeof window === 'undefined') {
      console.error('Running in SSR context');
      alert('Recording is not available in this environment');
      return;
    }
    
    if (!window.navigator) {
      console.error('Navigator not available');
      alert('Audio recording is not supported in this browser');
      return;
    }
    
    if (!navigator.mediaDevices) {
      console.error('MediaDevices not available');
      alert('Audio recording requires a secure context (HTTPS) or localhost');
      return;
    }
    
    if (!navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia not available');
      alert('Your browser doesn\'t support audio recording');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioData(prev => ({
          ...prev,
          [currentQuestionIndex]: audioUrl
        }));
        
        setAudioBlobs(prev => ({
          ...prev,
          [currentQuestionIndex]: audioBlob
        }));
        
        // Use the transcript from speech recognition if available
        if (transcript) {
          setResponses(prev => ({
            ...prev,
            [currentQuestionIndex]: transcript
          }));
        } else {
          // Fallback to simulated transcription if speech recognition failed
          simulateTranscription(currentQuestionIndex);
        }
        
        console.log('Recording completed and processed.');
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      console.log('Recording started.');
      
      // Start speech recognition alongside recording
      startSpeechRecognition();
      
    } catch (error: any) {
      console.error('Recording error:', error);
      // Provide specific error messages based on error type
      if (error.name === 'NotAllowedError') {
        alert('Microphone access was denied. Please allow microphone access in your browser settings.');
      } else {
        alert(`Recording failed: ${error.message}`);
      }
      
      // Fallback to simulation for demo purposes
      simulateTranscription(currentQuestionIndex);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      // Stop speech recognition
      stopSpeechRecognition();
      
      console.log('Recording stopped.');
    }
  };
  
  const simulateTranscription = (questionIndex: number) => {
    // Only simulate if we don't have a real transcript
    if (transcript) {
      setResponses(prev => ({
        ...prev,
        [questionIndex]: transcript
      }));
      return;
    }
    
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
  
  const sendAudioToBackend = async (questionIndex: number) => {
    if (!audioBlobs[questionIndex]) {
      console.log('No audio blob available for this question');
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log(`Sending audio for question ${questionIndex + 1} to backend for transcription`);
      
      const reader = new FileReader();
      
      return new Promise<void>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Audio = reader.result?.toString().split(',')[1];
            
            if (!base64Audio) {
              console.error('Failed to convert audio to base64');
              setIsSubmitting(false);
              reject(new Error('Failed to convert audio to base64'));
              return;
            }
            
            const response = await fetch('http://localhost:5050/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                questionIndex,
                audioBase64: base64Audio,
                question: questions[questionIndex],
                jobTitle
              })
            });
            
            if (!response.ok) {
              throw new Error(`Failed to transcribe audio: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Transcription response:', data);
            
            if (data.transcript) {
              setResponses(prev => ({
                ...prev,
                [questionIndex]: data.transcript
              }));
            }
            
            setIsSubmitting(false);
            resolve();
          } catch (error) {
            console.error('Error sending audio to backend:', error);
            setIsSubmitting(false);
            reject(error);
          }
        };
        
        reader.onerror = () => {
          console.error('Error reading audio file');
          setIsSubmitting(false);
          reject(new Error('Error reading audio file'));
        };
        
        reader.readAsDataURL(audioBlobs[questionIndex]);
      });
    } catch (error) {
      console.error('Error preparing audio for backend:', error);
      setIsSubmitting(false);
      throw error;
    }
  };
  
  const handleNextQuestion = async () => {
    if (isSubmitting) return;
    
    try {
      if (audioBlobs[currentQuestionIndex]) {
        await sendAudioToBackend(currentQuestionIndex);
      }
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setInterviewComplete(true);
        setShowTranscript(true);
      }
    } catch (error) {
      console.error('Error processing next question:', error);
      
      // Continue anyway so the user isn't stuck
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setInterviewComplete(true);
        setShowTranscript(true);
      }
    }
  };
  
  const handleFinishInterview = async () => {
    if (isSubmitting) return;
    
    try {
      if (audioBlobs[currentQuestionIndex]) {
        await sendAudioToBackend(currentQuestionIndex);
      }
    } catch (error) {
      console.error('Error sending final audio:', error);
    } finally {
      setInterviewComplete(true);
      setShowTranscript(true);
    }
  };
  
  const handleReturnHome = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('interviewQuestions');
      localStorage.removeItem('jobTitle');
    }
    
    router.push('/');
  };
  
  const handlePlayQuestion = () => {
    if (!isPlaying && !isRecording && countdown === null) {
      playQuestionAudio();
    }
  };
  
  const handleRecordAgain = () => {
    // Clear the previous response and restart
    setResponses(prev => {
      const newResponses = {...prev};
      delete newResponses[currentQuestionIndex];
      return newResponses;
    });
    
    // Reset the played state so we can re-listen
    setQuestionPlayed(prev => ({
      ...prev,
      [currentQuestionIndex]: false
    }));
    
    // Clear transcript
    setTranscript('');
    
    // Remove the audio data for this question to start fresh
    setAudioBlobs(prev => {
      const newBlobs = {...prev};
      delete newBlobs[currentQuestionIndex];
      return newBlobs;
    });
    
    // Start playback again
    setTimeout(() => playQuestionAudio(), 300);
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
                disabled={isRecording || isSubmitting || countdown !== null}
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
                      disabled={isSubmitting || isRecording || countdown !== null}
                      className={`px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700 transition ${
                        (isSubmitting || isRecording || countdown !== null) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
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
                    
                    {/* Audio controls */}
                    <div className="mt-4 flex items-center">
                      {!audioReady && !isPlaying && !isRecording && countdown === null && !responses[currentQuestionIndex] && (
                        <div className="flex items-center text-gray-400">
                          <span className="mr-2 animate-spin">⏳</span>
                          <span>Loading question audio...</span>
                        </div>
                      )}
                      
                      {audioReady && !isPlaying && !isRecording && countdown === null && !responses[currentQuestionIndex] && (
                        <button 
                          onClick={handlePlayQuestion}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                          <span className="mr-2">▶️</span>
                          Play Question
                        </button>
                      )}
                      
                      {/* Audio playing status */}
                      {isPlaying && (
                        <div className="flex items-center text-blue-400">
                          <span className="mr-2">🔊</span>
                          <div className="flex space-x-1">
                            <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse delay-0"></span>
                            <span className="w-1 h-6 bg-blue-400 rounded-full animate-pulse delay-150"></span>
                            <span className="w-1 h-8 bg-blue-400 rounded-full animate-pulse delay-300"></span>
                            <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse delay-450"></span>
                          </div>
                          <span className="ml-3">Playing question audio...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Recording Interface */}
                <div className="mb-8">
                  <div className="flex flex-col items-center space-y-6">
                    {countdown !== null && (
                      <div className="flex flex-col items-center animate-pulse">
                        <div className="w-24 h-24 rounded-full bg-yellow-600 flex items-center justify-center mb-3 text-4xl font-bold">
                          {countdown}
                        </div>
                        <p className="text-yellow-400 font-medium mb-2">Get ready to answer...</p>
                        <p className="text-gray-400 text-sm">Recording will start automatically</p>
                      </div>
                    )}
                    
                    {isRecording && (
                      <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center mb-3 animate-pulse">
                          <span className="text-4xl">🎙️</span>
                        </div>
                        <p className="text-red-400 font-medium mb-2">Recording in progress...</p>
                        <p className="text-gray-400 text-sm mb-6">Speak clearly into your microphone</p>
                        
                        {/* Show live transcript */}
                        {transcript && (
                          <div className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 mb-6 max-h-40 overflow-y-auto">
                            <p className="text-gray-300 text-sm">{transcript}</p>
                          </div>
                        )}
                        
                        <button
                          onClick={stopRecording}
                          className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition flex items-center"
                        >
                          <span className="mr-2">⏹️</span>
                          Stop Recording
                        </button>
                      </div>
                    )}
                    
                    {!isRecording && countdown === null && (
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
                            ? "Your answer has been recorded and will be sent when you proceed to the next question"
                            : "Click 'Play Question' to hear the question and begin answering"}
                        </p>
                        
                        {/* Show play button for question when no response is recorded */}
                        {!isPlaying && !isRecording && countdown === null && !responses[currentQuestionIndex] && audioReady && (
                          <button 
                            onClick={handlePlayQuestion}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center"
                          >
                            <span className="mr-2">🔊</span>
                            Play Question
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Response preview if available */}
                {responses[currentQuestionIndex] && !isRecording && (
                  <div className="mb-8 bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <h4 className="text-lg font-medium text-white mb-2">Your Response:</h4>
                    <p className="text-gray-300">{responses[currentQuestionIndex]}</p>
                  </div>
                )}
                
                {/* Navigation */}
                <div className="flex justify-between mt-12">
                  <button
                    onClick={() => {
                      // Only allow navigation if not currently recording or submitting
                      if (!isRecording && countdown === null && !isSubmitting) {
                        setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
                      }
                    }}
                    disabled={currentQuestionIndex === 0 || isRecording || countdown !== null || isSubmitting}
                    className={`px-6 py-3 rounded-lg font-medium transition flex items-center ${
                      currentQuestionIndex === 0 || isRecording || countdown !== null || isSubmitting
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                        : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    }`}
                  >
                    <span className="mr-2">←</span>
                    Previous
                  </button>
                  
                  <button
                    onClick={handleNextQuestion}
                    disabled={!responses[currentQuestionIndex] || isRecording || countdown !== null || isSubmitting}
                    className={`px-6 py-3 font-medium rounded-lg transition flex items-center ${
                      !responses[currentQuestionIndex] || isRecording || countdown !== null || isSubmitting
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : currentQuestionIndex < questions.length - 1 ? (
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