import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RehabilitationResults() {
  const [plan, setPlan] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedPlan = localStorage.getItem('rehabPlan');
    if (!savedPlan) {
      navigate('/rehabilitation/assessment');
      return;
    }
    setPlan(JSON.parse(savedPlan));
  }, [navigate]);

  if (!plan) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Rehabilitation Plan
          </h2>

          {/* Patient Details */}
          <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Patient Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400">Injury Type</p>
                <p className="text-white font-medium">{plan.patient_details.injury_type}</p>
              </div>
              <div>
                <p className="text-gray-400">Age</p>
                <p className="text-white font-medium">{plan.patient_details.age} years</p>
              </div>
              <div>
                <p className="text-gray-400">Gender</p>
                <p className="text-white font-medium">{plan.patient_details.gender}</p>
              </div>
              <div>
                <p className="text-gray-400">Height</p>
                <p className="text-white font-medium">{plan.patient_details.height} cm</p>
              </div>
              <div>
                <p className="text-gray-400">Weight</p>
                <p className="text-white font-medium">{plan.patient_details.weight} kg</p>
              </div>
              <div>
                <p className="text-gray-400">BMI</p>
                <p className="text-white font-medium">{plan.patient_details.bmi}</p>
              </div>
            </div>
          </div>

          {/* Rehabilitation Phases */}
          <div className="space-y-6">
            {Object.entries(plan.rehabilitation_plan).map(([phase, data]) => (
              <div key={phase} className="bg-gray-800/30 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">{phase}</h3>
                
                {/* Goals */}
                <div className="mb-4">
                  <h4 className="text-primary-500 font-medium mb-2">Goals</h4>
                  <ul className="list-disc list-inside text-gray-300">
                    {data.goals.map((goal, index) => (
                      <li key={index}>{goal}</li>
                    ))}
                  </ul>
                </div>

                {/* Exercises */}
                <div>
                  <h4 className="text-primary-500 font-medium mb-2">Exercises</h4>
                  <div className="grid gap-4">
                    {data.exercises.map((exercise, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4">
                        <p className="text-white font-medium">{exercise}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {data.sets[0] || 'N/A'} sets × {data.reps[0] || 'N/A'} reps
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Print Plan
            </button>
            <button
              onClick={() => navigate('/rehabilitation/assessment')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              New Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 