import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { commonStyles as styles } from '../styles/common';

export default function Rehabilitation() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  // Initialize speech recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  // Configure recognition
  const initRecognition = useCallback(() => {
    if (!recognition) return null;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsRecording(true);
      setError('');
      setAudioChunks([]); // Reset audio chunks
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      switch (event.error) {
        case 'no-speech':
          setError('No speech was detected. Please try again.');
          break;
        case 'audio-capture':
          setError('No microphone was found. Ensure it is plugged in and allowed.');
          break;
        case 'not-allowed':
          setError('Microphone permission was denied. Please allow access and try again.');
          break;
        default:
          setError('Error recording speech. Please try again.');
      }
      stopRecording();
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsRecording(false);
    };

    return recognition;
  }, [recognition]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    // Check profile completion
    const checkProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        // Check if all required fields are filled
        const isComplete = data && data.name && data.gender && data.dob && 
                          data.country && data.height && data.weight;
        setProfileComplete(isComplete);
      } catch (err) {
        console.error('Error checking profile:', err);
      }
    };

    const fetchRehabilitation = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/rehabilitation`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (response.ok && data.description) {
          setDescription(data.description);
        }
      } catch (err) {
        console.error('Error fetching rehabilitation data:', err);
      }
    };

    checkProfile();
    if (isAuthenticated) {
      fetchRehabilitation();
      initRecognition();
    }
  }, [isAuthenticated, navigate, initRecognition]);

  const startRecording = async () => {
    if (!recognition) {
      setError('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setAudioChunks(chunks);

      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        if (result.isFinal) {
          const transcript = result[0].transcript;
          setDescription(prev => {
            const prefix = prev ? prev + '\n' : '';
            return prefix + transcript.trim();
          });
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition start error:', err);
      setError('Failed to start speech recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (err) {
        console.error('Speech recognition stop error:', err);
      }
    }
    setIsRecording(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('description', description);
      if (audioBlob) {
        formData.append('audio', audioBlob);
      }

      const response = await fetch(`${API_BASE_URL}/auth/rehabilitation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      setSuccess('Rehabilitation information saved successfully!');
      setAudioBlob(null); // Reset audio blob after successful save
    } catch (err) {
      setError(err.message || 'Failed to save rehabilitation information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${styles.gradients.secondary} p-6`}>
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <div className={styles.cards.primary}>
          <h2 className={`${styles.text.title} mb-6`}>
            Rehabilitation Center
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Assessment Card */}
            <div className={`${styles.cards.secondary} ${styles.cards.interactive}`}>
              <h3 className={styles.text.subtitle}>New Assessment</h3>
              <p className={`${styles.text.body} mb-4`}>
                Get a personalized rehabilitation plan based on your injury and profile.
              </p>
              <button
                onClick={() => navigate('/rehabilitation/assessment')}
                className={styles.buttons.primary}
              >
                Start Assessment
              </button>
            </div>

            {/* Previous Plans Card */}
            <div className={`${styles.cards.secondary} ${styles.cards.interactive}`}>
              <h3 className={styles.text.subtitle}>View Previous Plans</h3>
              <p className={`${styles.text.body} mb-4`}>
                Access your previously generated rehabilitation plans.
              </p>
              <button
                onClick={() => navigate('/rehabilitation/results')}
                className={styles.buttons.secondary}
              >
                View Plans
              </button>
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-8 p-6 bg-gray-800/20 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-primary-500 font-semibold">Step 1</div>
                <h4 className="text-white font-medium">Complete Assessment</h4>
                <p className="text-gray-400 text-sm">
                  Enter your injury details to get started with your rehabilitation plan.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-primary-500 font-semibold">Step 2</div>
                <h4 className="text-white font-medium">Get Your Plan</h4>
                <p className="text-gray-400 text-sm">
                  Receive a personalized plan with exercises and progression phases.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-primary-500 font-semibold">Step 3</div>
                <h4 className="text-white font-medium">Track Progress</h4>
                <p className="text-gray-400 text-sm">
                  Follow your plan and track your recovery progress over time.
                </p>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <h4 className="text-yellow-500 font-medium mb-2">Important Note</h4>
            <p className="text-gray-400 text-sm">
              Always consult with a healthcare professional before starting any rehabilitation program.
              This tool is meant to supplement, not replace, professional medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 