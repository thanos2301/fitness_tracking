import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';

export default function Support() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your FitLife Pro fitness assistant. How can I help you with your fitness journey today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        setInputMessage(prev => prev + ' ' + lastResult[0].transcript);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'audio-capture') {
        console.error('Microphone not accessible. Please check your microphone settings.');
        alert('Microphone not accessible. Please check your microphone settings.');
      } else if (event.error === 'no-speech') {
        console.warn('No speech detected. Please try speaking again.');
        alert('No speech detected. Please try speaking again.');
        setIsRecording(false);
      } else {
        console.error('Speech recognition error:', event.error);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    return () => {
      recognition.stop();
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) {
      console.error('Speech recognition not initialized.');
      return;
    }

    if (isRecording) {
      console.warn('Recognition is already running.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        recognitionRef.current.start();
        setIsRecording(true);
      })
      .catch(err => {
        console.error('Error accessing microphone:', err);
        alert('Error accessing microphone. Please check your microphone settings.');
      });
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setError('');
    const userMessage = {
      role: 'user',
      content: inputMessage
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please sign in to use the chat');
      }

      // Add delay before sending request
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await fetch(`${API_BASE_URL}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage.content
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          throw new Error('Please sign in again to continue');
        }
        throw new Error(data.error || 'Unable to get response. Please try again.');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);

    } catch (error) {
      console.error('Chat error:', error);
      setError(error.message);
      
      if (error.message.includes('sign in')) {
        navigate('/signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Suggested questions with their predefined answers
  const suggestedQuestions = [
    {
      question: "How can I improve my workout form?",
      answer: `Here are key tips to improve your workout form:

1. Start Light: Begin with lighter weights to master the movement pattern
2. Use Mirrors: Practice in front of mirrors to check your form
3. Record Yourself: Take videos to analyze your technique
4. Focus Points:
   • Maintain proper posture
   • Control the movement
   • Keep consistent tempo
   • Breathe properly
5. Consider working with a trainer initially
6. Always prioritize form over weight/reps`
    },
    {
      question: "What's a balanced diet plan?",
      answer: `A balanced diet plan includes:

1. Macronutrients Distribution:
   • Protein: 20-30% of calories
   • Carbs: 45-65% of calories
   • Healthy Fats: 20-35% of calories

2. Key Components:
   • Lean proteins (chicken, fish, legumes)
   • Complex carbs (whole grains, vegetables)
   • Healthy fats (avocados, nuts, olive oil)
   • Fruits and vegetables
   • Adequate fiber (25-35g daily)

3. Meal Timing:
   • 3 main meals
   • 2-3 healthy snacks
   • Regular eating schedule`
    },
    {
      question: "Tips for muscle recovery?",
      answer: `Essential muscle recovery tips:

1. Rest & Sleep:
   • Get 7-9 hours of sleep
   • Take rest days between workouts
   • Listen to your body

2. Nutrition:
   • Adequate protein intake
   • Stay hydrated
   • Post-workout nutrition

3. Recovery Techniques:
   • Gentle stretching
   • Foam rolling
   • Light activity on rest days
   • Proper cool-down
   • Compression garments
   • Ice/heat therapy as needed`
    },
    {
      question: "Best exercises for weight loss?",
      answer: `Effective exercises for weight loss:

1. Cardio Exercises:
   • HIIT (High-Intensity Interval Training)
   • Running/Jogging
   • Swimming
   • Cycling
   • Jump rope

2. Strength Training:
   • Compound exercises
   • Circuit training
   • Bodyweight exercises
   • Resistance training

3. Workout Structure:
   • 30-60 minutes per session
   • 3-5 sessions per week
   • Mix cardio and strength
   • Progressive overload`
    },
    {
      question: "How to prevent workout injuries?",
      answer: `Injury prevention guidelines:

1. Proper Warm-up:
   • Dynamic stretching
   • Light cardio
   • Movement preparation

2. Training Smart:
   • Progress gradually
   • Use proper form
   • Don't skip rest days
   • Stay within your limits

3. Recovery Practices:
   • Adequate rest between sessions
   • Proper nutrition
   • Stay hydrated
   • Listen to your body

4. Equipment & Environment:
   • Proper shoes/gear
   • Safe workout space
   • Good technique`
    },
    {
      question: "Recommended pre-workout meals?",
      answer: `Pre-workout nutrition guidelines:

1. Timing: 2-3 hours before workout
2. Meal Components:
   • Complex carbs for energy
   • Moderate protein
   • Low fat for easy digestion

3. Good Options:
   • Oatmeal with banana and protein
   • Toast with eggs
   • Greek yogurt with berries
   • Smoothie with protein

4. Quick Snacks (30-60 mins before):
   • Banana
   • Energy bar
   • Apple with peanut butter`
    },
    {
      question: "How much protein do I need daily?",
      answer: `Daily protein requirements:

1. General Guidelines:
   • Sedentary: 0.8g per kg bodyweight
   • Active: 1.2-1.7g per kg bodyweight
   • Athletes: 1.6-2.2g per kg bodyweight

2. Good Protein Sources:
   • Lean meats
   • Fish
   • Eggs
   • Dairy
   • Legumes
   • Plant-based options

3. Timing:
   • Spread intake throughout the day
   • Include in every meal
   • Post-workout protein important`
    },
    {
      question: "Best stretches for flexibility?",
      answer: `Essential stretches for flexibility:

1. Dynamic Stretches:
   • Leg swings
   • Arm circles
   • Hip rotations
   • Walking lunges

2. Static Stretches:
   • Hamstring stretch
   • Hip flexor stretch
   • Shoulder stretch
   • Lower back stretch

3. Guidelines:
   • Hold each stretch 15-30 seconds
   • Don't bounce
   • Breathe steadily
   • Stretch regularly
   • Warm up first`
    }
  ];

  const handleSuggestedQuestion = async (questionObj) => {
    // Add user's question to chat immediately
    const userMessage = {
      role: 'user',
      content: questionObj.question
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage(''); // Clear input field
    setIsLoading(true);

    // Add delay before showing the answer
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Add predefined answer after delay
    const assistantMessage = {
      role: 'assistant',
      content: questionObj.answer
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Fitness Assistant</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}

          {/* Chat Container */}
          <div 
            ref={chatContainerRef}
            className="bg-black/20 rounded-lg p-4 h-[600px] overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-gray-100 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <div className="flex-1 flex space-x-2 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your fitness question here..."
                className="w-full p-3 rounded-lg bg-black/30 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors
                  ${isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                title="Toggle voice input"
              >
                {isRecording ? (
                  // Microphone recording icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                ) : (
                  // Microphone icon
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>

          {/* Suggested Questions */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Suggested Questions</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((questionObj, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(questionObj)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-700/50 text-gray-200 rounded-full hover:bg-gray-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {questionObj.question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 