import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

// Initial system prompt to set context
const SYSTEM_PROMPT = `You are a knowledgeable fitness and nutrition expert AI assistant for the FitLife Pro app. 
Your role is to provide accurate, helpful, and encouraging advice about:
- Exercise form and technique
- Nutrition and diet planning
- Workout routines
- Recovery strategies
- Injury prevention
- General fitness questions
- Health and wellness tips

Always prioritize safety and recommend consulting healthcare professionals when appropriate.
Keep responses concise, practical, and easy to understand.`;

export default function Support() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your FitLife Pro AI assistant. How can I help you today with your fitness and nutrition questions?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please sign in to use the chat');
      }

      const response = await fetch(`${API_BASE_URL}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: inputMessage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'AI service error') {
          throw new Error('Our AI assistant is temporarily unavailable. Please try again later.');
        }
        throw new Error(data.error || data.details || 'Failed to get response');
      }

      if (!data.message) {
        throw new Error('Invalid response format from server');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError(error.message);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble responding right now. Our AI service is temporarily unavailable. Please try again in a few moments."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Expanded suggested questions
  const suggestedQuestions = [
    "How can I improve my workout form?",
    "What's a balanced diet plan?",
    "Tips for muscle recovery?",
    "Best exercises for weight loss?",
    "How to prevent workout injuries?",
    "Recommended pre-workout meals?",
    "How much protein do I need daily?",
    "Best stretches for flexibility?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">AI Support Assistant</h2>

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
            {isTyping && (
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
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your question here..."
              className="flex-1 p-3 rounded-lg bg-black/30 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !inputMessage.trim()}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTyping ? 'Thinking...' : 'Send'}
            </button>
          </form>

          {/* Suggested Questions */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Suggested Questions</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  disabled={isTyping}
                  className="px-4 py-2 bg-gray-700/50 text-gray-200 rounded-full hover:bg-gray-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 