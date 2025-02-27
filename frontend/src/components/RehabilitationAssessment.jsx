import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export default function RehabilitationAssessment() {
  const [injuryType, setInjuryType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const commonInjuries = [
    'ACL Tear',
    'Ankle Sprain',
    'Rotator Cuff Injury',
    'Tennis Elbow',
    'Lower Back Pain',
    'Knee Meniscus Tear',
    'Hamstring Strain',
    'Shoulder Impingement'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending request to:', `${API_BASE_URL}/rehabilitation/assessment`);
      console.log('With data:', { injury_type: injuryType });

      const response = await fetch(`${API_BASE_URL}/rehabilitation/assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ injury_type: injuryType })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate rehabilitation plan');
      }

      localStorage.setItem('rehabPlan', JSON.stringify(data));
      navigate('/rehabilitation/results');
    } catch (error) {
      console.error('Error details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Rehabilitation Assessment
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Injury Type
              </label>
              <input
                type="text"
                value={injuryType}
                onChange={(e) => setInjuryType(e.target.value)}
                className="w-full p-3 bg-black/20 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., ACL Tear"
                required
              />
            </div>

            {/* Common Injuries Suggestions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Common Injuries
              </label>
              <div className="flex flex-wrap gap-2">
                {commonInjuries.map((injury) => (
                  <button
                    key={injury}
                    type="button"
                    onClick={() => setInjuryType(injury)}
                    className="px-3 py-1 text-sm bg-gray-700/50 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    {injury}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !injuryType.trim()}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating Plan...' : 'Generate Rehabilitation Plan'}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-gray-800/30 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Note</h3>
            <p className="text-gray-400 text-sm">
              This assessment will generate a personalized rehabilitation plan based on your injury type
              and profile information. Make sure your profile details are up to date for the most
              accurate recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 