import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

export default function FormTrack() {
  const [isRecording, setIsRecording] = useState(false);
  const [exerciseType, setExerciseType] = useState("squat");
  const [repCount, setRepCount] = useState({ squat: 0, pushup: 0, bicep: 0 });
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const timeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
  }, []);

  const resetCounter = async () => {
    try {
      await fetch(`${API_BASE_URL}/form-check/reset/${exerciseType}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRepCount(prev => ({ ...prev, [exerciseType]: 0 }));
    } catch (error) {
      console.error('Error resetting counter:', error);
    }
  };

  const handleExerciseChange = async (e) => {
    const newExercise = e.target.value;
    console.log("Switching to exercise:", newExercise);  // Debug log
    setExerciseType(newExercise);
    
    // Reset the counter for the new exercise
    try {
        await fetch(`${API_BASE_URL}/form-check/reset/${newExercise}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        setRepCount(prev => ({ ...prev, [newExercise]: 0 }));
        setFeedback('');  // Clear previous feedback
    } catch (error) {
        console.error('Error resetting counter:', error);
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current) return;

    console.log("📸 Capturing frame for", exerciseType);  // Debug log

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      console.log("📤 Sending frame to backend for", exerciseType);

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");
      formData.append("exercise", exerciseType.toLowerCase());  // Ensure lowercase

      try {
        setIsProcessing(true);

        const response = await fetch(`${API_BASE_URL}/form-check/process`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData,
        });

        if (!response.ok) throw new Error(`❌ Server error: ${response.status}`);

        const data = await response.json();
        console.log("✅ Response from backend:", data);
        
        // Update rep count only if stage changes from down to up
        if (data.stage === 'up' && data.prev_stage === 'down') {
          setRepCount(prev => ({
            ...prev,
            [exerciseType]: prev[exerciseType] + 1
          }));
        }
        
        setFeedback(data.form_feedback);
      } catch (error) {
        console.error("❌ Error processing frame:", error);
        setFeedback("Error analyzing form, please try again.");
      } finally {
        setIsProcessing(false);
      }
    }, "image/jpeg");
  };

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, frameRate: { ideal: 10 } },
      });

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsRecording(true);
      setFeedback("");
      setSessionTime(0);

      // Start capturing frames at regular intervals
      intervalRef.current = setInterval(captureFrame, 1000);
      
      // Start session timer
      timeRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing camera:", error);
      setFeedback("Camera access denied. Please check permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeRef.current) clearInterval(timeRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    videoRef.current.srcObject = null;
    setIsRecording(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Form Track
          </h2>

          {/* Exercise Selection */}
          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 dark:text-white mb-2">
              Select Exercise
            </label>
            <select
              value={exerciseType}
              onChange={handleExerciseChange}
              disabled={isRecording}
              className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="squat">Squats</option>
              <option value="pushup">Push-ups</option>
              <option value="bicep">Bicep Curls</option>
            </select>
          </div>

          {/* Video Feed */}
          <div className="relative aspect-video mb-6 bg-black rounded-lg overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {/* Exercise Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Rep Counter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Rep Count
              </h3>
              <div className="text-4xl font-bold text-primary-600">
                {repCount[exerciseType]}
              </div>
            </div>

            {/* Current Exercise */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Exercise
              </h3>
              <div className="text-2xl font-bold text-primary-600 capitalize">
                {exerciseType}
              </div>
            </div>

            {/* Form Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Form Status
              </h3>
              <div className={`text-lg font-semibold ${
                feedback.includes('Good') 
                  ? 'text-green-500' 
                  : feedback.includes('Adjust') 
                    ? 'text-yellow-500'
                    : 'text-red-500'
              }`}>
                {feedback || 'Waiting...'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={isRecording ? stopCamera : startCamera}
              className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              } shadow-lg hover:shadow-xl w-full sm:w-auto`}
            >
              {isRecording ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-pulse">●</span> Stop Recording
                </span>
              ) : (
                'Start Recording'
              )}
            </button>

            {/* Session Stats */}
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Session Duration: {formatTime(sessionTime)}
            </div>
          </div>

          {/* Form Feedback Card */}
          {feedback && (
            <div className={`mt-6 p-4 rounded-lg transition-all duration-300 ${
              feedback.includes('Good') 
                ? 'bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500' 
                : feedback.includes('Adjust')
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500'
                  : 'bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500'
            }`}>
              <div className="flex items-start">
                <div className={`p-2 rounded-full mr-4 ${
                  feedback.includes('Good') 
                    ? 'bg-green-200 dark:bg-green-800' 
                    : feedback.includes('Adjust')
                      ? 'bg-yellow-200 dark:bg-yellow-800'
                      : 'bg-red-200 dark:bg-red-800'
                }`}>
                  {feedback.includes('Good') ? '✓' : '!'}
                </div>
                <div>
                  <h4 className={`text-lg font-semibold mb-1 ${
                    feedback.includes('Good') 
                      ? 'text-green-800 dark:text-green-200' 
                      : feedback.includes('Adjust')
                        ? 'text-yellow-800 dark:text-yellow-200'
                        : 'text-red-800 dark:text-red-200'
                  }`}>
                    Form Feedback
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">{feedback}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
