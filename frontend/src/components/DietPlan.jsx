import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

export default function DietPlan() {
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userMetrics, setUserMetrics] = useState(null);
  const [goal, setGoal] = useState('balance'); // 'weightloss', 'weightgain', or 'balance'

  useEffect(() => {
    fetchUserMetrics();
  }, []);

  const fetchUserMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user metrics');
      }

      const data = await response.json();
      setUserMetrics(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const generatePlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/diet/plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goal })
      });

      if (!response.ok) {
        throw new Error('Failed to generate diet plan');
      }

      const data = await response.json();
      setDietPlan(data.weeklyPlan);
      setUserMetrics(data.metrics);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Your Personalized Diet Plan
            </h1>
            <div className="flex items-center gap-4">
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white"
              >
                <option value="balance">Maintain Weight</option>
                <option value="weightloss">Weight Loss</option>
                <option value="weightgain">Weight Gain</option>
              </select>
              <button
                onClick={generatePlan}
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Today's Plan"}
              </button>
            </div>
          </div>

          {userMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-primary-500/10 rounded-lg p-4">
                <div className="text-sm text-primary-600 dark:text-primary-400">BMI</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{userMetrics.bmi}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {userMetrics.bmi < 18.5 ? 'Underweight' : 
                   userMetrics.bmi < 25 ? 'Normal' : 
                   userMetrics.bmi < 30 ? 'Overweight' : 'Obese'}
                </div>
              </div>
              <div className="bg-primary-500/10 rounded-lg p-4">
                <div className="text-sm text-primary-600 dark:text-primary-400">Daily Calories</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{userMetrics.dailyCalories} kcal</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{userMetrics.goalDescription}</div>
              </div>
              <div className="bg-primary-500/10 rounded-lg p-4">
                <div className="text-sm text-primary-600 dark:text-primary-400">Weekly Protein</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{userMetrics.weeklyProtein}g</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Target: {Math.round(userMetrics.weight * 2)}g/day</div>
              </div>
              <div className="bg-primary-500/10 rounded-lg p-4">
                <div className="text-sm text-primary-600 dark:text-primary-400">Activity Level</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{userMetrics.activityLevel}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Multiplier: 1.375x</div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {dietPlan ? (
            <div className="space-y-8">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                <div key={day} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{day}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(dietPlan[index] || {}).map(([mealType, meal]) => (
                      <div key={mealType} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize mb-2">
                          {mealType}
                        </h3>
                        <div className="space-y-2">
                          <p className="text-gray-800 dark:text-gray-200">{meal.food}</p>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p>Calories: {meal.calories}kcal</p>
                            <p>Protein: {meal.protein}g</p>
                            <p>Carbs: {meal.carbs}g</p>
                            <p>Fats: {meal.fats}g</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              Select your goal and click "Generate Today's Plan" to get your personalized diet recommendations
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 