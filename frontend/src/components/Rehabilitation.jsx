import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { commonStyles as styles } from '../styles/common';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const injuryTypes = {
  "Knee Injury": {
    phases: ["Acute", "Recovery", "Strengthening", "Return to Activity"],
    exercises: {
      Acute: [
        { name: "RICE Protocol", duration: "48-72 hours", description: "Rest, Ice, Compression, Elevation" },
        { name: "Gentle Range of Motion", duration: "5-10 mins", frequency: "2-3 times daily" }
      ],
      Recovery: [
        { name: "Straight Leg Raises", sets: "3", reps: "10", frequency: "Daily" },
        { name: "Hamstring Stretches", duration: "30 seconds", sets: "3", frequency: "Daily" },
        { name: "Ankle Pumps", sets: "3", reps: "15", frequency: "3 times daily" }
      ],
      Strengthening: [
        { name: "Wall Squats", sets: "3", reps: "10", frequency: "Every other day" },
        { name: "Step-Ups", sets: "3", reps: "12", frequency: "Every other day" },
        { name: "Resistance Band Exercises", sets: "3", reps: "15", frequency: "Daily" }
      ],
      "Return to Activity": [
        { name: "Walking Program", duration: "20-30 mins", frequency: "Daily" },
        { name: "Balance Training", duration: "10-15 mins", frequency: "Daily" },
        { name: "Sport-Specific Exercises", duration: "As tolerated", frequency: "3-4 times/week" }
      ]
    }
  },
  "Back Pain": {
    phases: ["Acute", "Subacute", "Strengthening", "Maintenance"],
    exercises: {
      Acute: [
        { name: "Rest with proper positioning", duration: "24-48 hours" },
        { name: "Gentle Walking", duration: "5-10 mins", frequency: "Every 2-3 hours" }
      ],
      Subacute: [
        { name: "Cat-Cow Stretches", sets: "3", reps: "10", frequency: "Daily" },
        { name: "Pelvic Tilts", sets: "3", reps: "12", frequency: "Daily" },
        { name: "Bird Dog Exercise", sets: "3", reps: "10 each side", frequency: "Daily" }
      ],
      Strengthening: [
        { name: "Bridge Exercise", sets: "3", reps: "12", frequency: "Daily" },
        { name: "Modified Planks", duration: "20-30 seconds", sets: "3", frequency: "Daily" },
        { name: "Wall Angels", sets: "3", reps: "10", frequency: "Daily" }
      ],
      Maintenance: [
        { name: "Core Strengthening", duration: "15-20 mins", frequency: "3-4 times/week" },
        { name: "Flexibility Program", duration: "10-15 mins", frequency: "Daily" },
        { name: "Low-Impact Cardio", duration: "20-30 mins", frequency: "3-4 times/week" }
      ]
    }
  },
  "Ankle Sprain": {
    phases: ["Protection", "Recovery", "Strengthening", "Sport-Specific"],
    exercises: {
      Protection: [
        { name: "RICE Protocol", duration: "48-72 hours", description: "Rest, Ice, Compression, Elevation" },
        { name: "Ankle Alphabet", duration: "5 mins", frequency: "3-4 times daily" }
      ],
      Recovery: [
        { name: "Ankle Circles", sets: "3", reps: "10 each direction", frequency: "Daily" },
        { name: "Towel Stretches", duration: "30 seconds", sets: "3", frequency: "Daily" },
        { name: "Calf Raises", sets: "2", reps: "10", frequency: "Daily" }
      ],
      Strengthening: [
        { name: "Resistance Band Exercises", sets: "3", reps: "15", frequency: "Daily" },
        { name: "Single-Leg Balance", duration: "30 seconds", sets: "3", frequency: "Daily" },
        { name: "Heel Walks", duration: "1 minute", sets: "3", frequency: "Daily" }
      ],
      "Sport-Specific": [
        { name: "Jumping Progression", sets: "3", reps: "10", frequency: "Every other day" },
        { name: "Agility Drills", duration: "15 mins", frequency: "3 times/week" },
        { name: "Sport-Specific Movement", duration: "20 mins", frequency: "3-4 times/week" }
      ]
    }
  },
  "Shoulder Pain": {
    phases: ["Acute Care", "Mobility", "Strengthening", "Functional"],
    exercises: {
      "Acute Care": [
        { name: "Pendulum Exercise", duration: "5 mins", frequency: "3-4 times daily" },
        { name: "Ice Therapy", duration: "15-20 mins", frequency: "Every 2-3 hours" }
      ],
      Mobility: [
        { name: "Wall Slides", sets: "3", reps: "10", frequency: "Daily" },
        { name: "Doorway Stretch", duration: "30 seconds", sets: "3", frequency: "Daily" },
        { name: "Cross-Body Stretch", duration: "30 seconds", sets: "3", frequency: "Daily" }
      ],
      Strengthening: [
        { name: "External Rotation", sets: "3", reps: "15", frequency: "Daily" },
        { name: "Scapular Retraction", sets: "3", reps: "15", frequency: "Daily" },
        { name: "Band Pull-Aparts", sets: "3", reps: "15", frequency: "Daily" }
      ],
      Functional: [
        { name: "Push-Up Progression", sets: "3", reps: "As tolerated", frequency: "Every other day" },
        { name: "Overhead Activities", duration: "10-15 mins", frequency: "3 times/week" },
        { name: "Sport-Specific Training", duration: "20-30 mins", frequency: "3-4 times/week" }
      ]
    }
  },
  "Hip Pain": {
    phases: ["Rest & Relief", "Mobility", "Strengthening", "Advanced"],
    exercises: {
      "Rest & Relief": [
        { name: "Gentle Stretching", duration: "5-10 mins", frequency: "2-3 times daily" },
        { name: "Ice/Heat Therapy", duration: "15 mins", frequency: "Every 3-4 hours" }
      ],
      Mobility: [
        { name: "Hip Flexor Stretch", duration: "30 seconds", sets: "3", frequency: "Daily" },
        { name: "Figure-4 Stretch", duration: "30 seconds", sets: "3", frequency: "Daily" },
        { name: "Hip Circles", sets: "2", reps: "10 each direction", frequency: "Daily" }
      ],
      Strengthening: [
        { name: "Bridges", sets: "3", reps: "12", frequency: "Daily" },
        { name: "Clamshells", sets: "3", reps: "15 each side", frequency: "Daily" },
        { name: "Side-Lying Leg Raises", sets: "3", reps: "12 each side", frequency: "Daily" }
      ],
      Advanced: [
        { name: "Single-Leg Squats", sets: "3", reps: "10 each leg", frequency: "Every other day" },
        { name: "Lunges", sets: "3", reps: "12 each leg", frequency: "Every other day" },
        { name: "Step-Ups", sets: "3", reps: "15 each leg", frequency: "3 times/week" }
      ]
    }
  }
};

// Add assessment questions
const assessmentQuestions = {
  "Pain Level": {
    question: "What is your current pain level? (1-10)",
    type: "number",
    min: 1,
    max: 10
  },
  "Duration": {
    question: "How long have you been experiencing this injury?",
    type: "select",
    options: ["Less than a week", "1-4 weeks", "1-3 months", "More than 3 months"]
  },
  "Activity Level": {
    question: "What is your typical activity level?",
    type: "select",
    options: ["Sedentary", "Light activity", "Moderate activity", "Very active", "Athlete"]
  },
  "Previous Injury": {
    question: "Have you had this injury before?",
    type: "select",
    options: ["No", "Yes, once", "Yes, multiple times"]
  }
};

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
  const [userProfile, setUserProfile] = useState({ name: '', age: 0, gender: '', height: 0, weight: 0 });
  const [selectedInjury, setSelectedInjury] = useState('');
  const [daysInjured, setDaysInjured] = useState('');
  const [painLevel, setPainLevel] = useState('');
  const [rehabPlan, setRehabPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assessmentStep, setAssessmentStep] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [activeTab, setActiveTab] = useState('progress');

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

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setUserProfile({
          name: data.name,
          age: new Date().getFullYear() - new Date(data.dob).getFullYear(),
          gender: data.gender,
          height: data.height,
          weight: data.weight
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

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

  const startAssessment = () => {
    setAssessmentStep(true);
    setAssessmentAnswers({});
  };

  const handleAssessmentAnswer = (question, answer) => {
    setAssessmentAnswers(prev => ({
      ...prev,
      [question]: answer
    }));
  };

  const generateRehabPlan = () => {
    if (!selectedInjury || !daysInjured || !painLevel) {
      alert('Please fill in all fields');
      return;
    }

    const basePlan = injuryTypes[selectedInjury];
    if (!basePlan) {
      alert('Invalid injury type selected');
      return;
    }

    // Modify plan based on inputs
    const personalizedPlan = { ...basePlan };
    if (painLevel >= 7) {
      personalizedPlan.currentPhase = 0; // Start with acute phase
    } else if (painLevel >= 4) {
      personalizedPlan.currentPhase = 1; // Start with recovery phase
    } else {
      personalizedPlan.currentPhase = 2; // Start with strengthening phase
    }

    // Adjust exercises based on weight
    Object.keys(personalizedPlan.exercises).forEach(phase => {
      personalizedPlan.exercises[phase] = personalizedPlan.exercises[phase].map(ex => ({
        ...ex,
        sets: ex.sets ? String(Number(ex.sets) + Math.floor(userProfile.weight / 20)) : ex.sets
      }));
    });

    setRehabPlan(personalizedPlan);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Rehabilitation</h2>

          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 dark:text-white mb-2">
              Select Injury Type
            </label>
            <select
              value={selectedInjury}
              onChange={(e) => setSelectedInjury(e.target.value)}
              className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select an injury type</option>
              {Object.keys(injuryTypes).map(injury => (
                <option key={injury} value={injury}>{injury}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 dark:text-white mb-2">
              Days Injured
            </label>
            <input
              type="number"
              value={daysInjured}
              onChange={(e) => setDaysInjured(e.target.value)}
              className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-bold text-gray-800 dark:text-white mb-2">
              Pain Level (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={painLevel}
              onChange={(e) => setPainLevel(e.target.value)}
              className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <button
            onClick={generateRehabPlan}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-lg"
          >
            Generate Rehabilitation Plan
          </button>

          {rehabPlan && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Your Personalized Rehabilitation Plan
              </h3>
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
                Name: {userProfile.name}
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
                Age: {userProfile.age}
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
                Gender: {userProfile.gender}
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
                Height: {userProfile.height} cm
              </p>
              <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
                Weight: {userProfile.weight} kg
              </p>
              {rehabPlan.phases.map((phase, phaseIndex) => (
                <div key={phase} className="mb-8">
                  <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-4 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                    Phase {phaseIndex + 1}: {phase}
                  </h4>
                  <div className="grid gap-4">
                    {rehabPlan.exercises[phase].map((exercise, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 shadow-md border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow duration-200"
                      >
                        <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                          {exercise.name}
                        </h5>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(exercise).map(([key, value]) => (
                            key !== 'name' && (
                              <div key={key} className="flex justify-between items-center bg-white dark:bg-gray-600 p-2 rounded-lg">
                                <span className="font-semibold text-gray-700 dark:text-gray-200 capitalize">{key}:</span>
                                <span className="text-gray-900 dark:text-white">{value}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}