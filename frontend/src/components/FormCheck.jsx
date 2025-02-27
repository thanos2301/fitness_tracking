import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { commonStyles as styles } from '../styles/common';

export default function FormCheck() {
  const [exerciseType, setExerciseType] = useState('squat');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const exercises = [
    { id: 'squat', name: 'Squats' },
    { id: 'curl', name: 'Bicep Curls' },
    { id: 'pushup', name: 'Push-ups' }
  ];

  // Initialize camera when component mounts
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera. Please check permissions.');
      }
    };

    initCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startAnalysis = async () => {
    if (!stream) {
      setError('Camera not initialized. Please allow camera access.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setFeedback(null);

    try {
      console.log('Starting analysis for:', exerciseType);
      const response = await fetch(`${API_BASE_URL}/form-check/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ exercise_type: exerciseType })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze form');
      }

      const data = await response.json();
      console.log('Analysis result:', data);
      setFeedback(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to analyze form. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`min-h-screen ${styles.gradients.secondary} p-6`}>
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <div className={`${styles.cards.primary}`}>
          <h2 className={`${styles.text.title} mb-6`}>
            Exercise Form Check
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg animate-slideIn">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className={`block mb-2 ${styles.text.subtitle}`}>
              Select Exercise
            </label>
            <select
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value)}
              className={styles.inputs.primary}
            >
              {exercises.map(exercise => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6 aspect-video rounded-lg overflow-hidden shadow-xl transform hover:scale-102 transition-all duration-300">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={startAnalysis}
              disabled={isAnalyzing || !stream}
              className={`${styles.buttons.primary} ${isAnalyzing ? 'animate-pulse' : ''}`}
            >
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </button>
          </div>

          {feedback && (
            <div className="mt-8 animate-slideUp">
              <h3 className={`${styles.text.subtitle} mb-4`}>Feedback</h3>
              <div className="space-y-4">
                {feedback.map((item, index) => (
                  <div
                    key={index}
                    className={`${styles.cards.secondary} ${
                      item.feedback.status === 'perfect'
                        ? 'border-green-500'
                        : item.feedback.status === 'good'
                        ? 'border-blue-500'
                        : 'border-yellow-500'
                    } transform hover:scale-102 transition-all duration-300`}
                  >
                    <p className="text-white text-lg font-medium">{item.feedback.message}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Angle: {item.angle.toFixed(1)}°
                    </p>
                    <div className="mt-2 h-1 bg-gray-700/30 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          item.feedback.status === 'perfect'
                            ? 'bg-green-500'
                            : item.feedback.status === 'good'
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        } transition-all duration-500`}
                        style={{ width: `${(item.angle / 180) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 