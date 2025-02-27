import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format, startOfWeek, eachDayOfInterval, addDays, subDays } from 'date-fns';
import { API_BASE_URL } from '../config/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Expanded food database
const foodDatabase = {
  'rice': { calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4 },
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0 },
  'apple': { calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4 },
  'egg': { calories: 155, protein: 13, carbs: 1.1, fats: 11, fiber: 0 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6 },
  'salmon': { calories: 208, protein: 22, carbs: 0, fats: 13, fiber: 0 },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fats: 0.1, fiber: 3 },
  'quinoa': { calories: 120, protein: 4.4, carbs: 21, fats: 1.9, fiber: 2.8 },
  'greek yogurt': { calories: 59, protein: 10, carbs: 3.6, fats: 0.4, fiber: 0 },
  'almonds': { calories: 579, protein: 21, carbs: 22, fats: 50, fiber: 12.5 },
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fats: 0.4, fiber: 2.6 },
  'oatmeal': { calories: 389, protein: 16.9, carbs: 66, fats: 6.9, fiber: 10.6 },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, fiber: 2.2 },
  'beef': { calories: 250, protein: 26, carbs: 0, fats: 17, fiber: 0 },
  'lentils': { calories: 116, protein: 9, carbs: 20, fats: 0.4, fiber: 7.9 },
  'tofu': { calories: 144, protein: 15.9, carbs: 3.3, fats: 8.7, fiber: 2.3 },
  'avocado': { calories: 160, protein: 2, carbs: 8.5, fats: 14.7, fiber: 6.7 },
  'milk': { calories: 42, protein: 3.4, carbs: 5, fats: 1, fiber: 0 },
  'bread': { calories: 265, protein: 9, carbs: 49, fats: 3.2, fiber: 2.7 },
  'peanut butter': { calories: 588, protein: 25, carbs: 20, fats: 50, fiber: 6 }
};

export default function DietTracking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newMeal, setNewMeal] = useState({ foodName: '', quantity: '' });
  const [meals, setMeals] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0
  });
  const [weeklyData, setWeeklyData] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisType, setAnalysisType] = useState('daily'); // 'daily', 'weekly', 'monthly'
  const [chartType, setChartType] = useState('line'); // 'line', 'bar', 'pie'
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search food in database
  const handleFoodSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = Object.keys(foodDatabase)
      .filter(food => food.toLowerCase().includes(searchTerm.toLowerCase()));
    setSearchResults(results);
  };

  // Calculate nutrition based on quantity
  const calculateNutrition = (food, quantity) => {
    const nutrition = foodDatabase[food];
    if (!nutrition) return null;

    const multiplier = quantity / 100; // Convert to 100g basis
    return {
      calories: nutrition.calories * multiplier,
      protein: nutrition.protein * multiplier,
      carbs: nutrition.carbs * multiplier,
      fats: nutrition.fats * multiplier,
      fiber: nutrition.fiber * multiplier
    };
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!newMeal.foodName || !newMeal.quantity) return;

    const nutrition = calculateNutrition(newMeal.foodName, parseFloat(newMeal.quantity));
    if (!nutrition) return;

    const mealWithNutrition = {
      ...newMeal,
      ...nutrition,
      id: Date.now(),
      date: selectedDate.toISOString()
    };

    try {
      const response = await fetch(`${API_BASE_URL}/diet/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(mealWithNutrition)
      });

      if (!response.ok) throw new Error('Failed to save meal');

      const savedMeal = await response.json();
      setMeals(prev => [...prev, savedMeal]);
      setNewMeal({ foodName: '', quantity: '' });
      setSearchResults([]);
    } catch (error) {
      console.error('Error saving meal:', error);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      console.log('Attempting to delete meal with ID:', mealId);
      
      const response = await fetch(`${API_BASE_URL}/diet/meals/${mealId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Delete response status:', response.status);
      
      // First check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server returned non-JSON response for meal ID ${mealId}`);
      }

      const data = await response.json();
      console.log('Delete response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Failed to delete meal ${mealId}`);
      }

      // Update the meals list by removing the deleted meal
      setMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
      
      // Show success message
      setSuccessMessage('Meal deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Fetch updated weekly summary
      fetchWeeklySummary();
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError(error.message || 'Failed to delete meal. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Fetch meals for selected date
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/diet/meals/${selectedDate}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch meals');
        const data = await response.json();
        setMeals(data);
      } catch (error) {
        console.error('Error fetching meals:', error);
      }
    };

    fetchMeals();
  }, [selectedDate]);

  // Calculate daily totals
  useEffect(() => {
    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
      fiber: acc.fiber + meal.fiber
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 });
    
    setDailyTotals(totals);
  }, [meals]);

  // Fetch weekly data
  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/diet/weekly-summary`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch weekly data');
        const data = await response.json();
        setWeeklyData(data);
      } catch (error) {
        console.error('Error fetching weekly data:', error);
      }
    };

    fetchWeeklyData();
  }, [meals]);

  // Chart data preparation
  const getChartData = () => {
    const labels = weeklyData.map(day => format(new Date(day.date), 'MMM d'));
    
    if (chartType === 'pie') {
      return {
        labels: ['Protein', 'Carbs', 'Fats', 'Fiber'],
        datasets: [{
          data: [dailyTotals.protein, dailyTotals.carbs, dailyTotals.fats, dailyTotals.fiber],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
          ],
        }]
      };
    }

    return {
      labels,
      datasets: [
        {
          label: 'Calories',
          data: weeklyData.map(day => day.calories),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          fill: true,
        },
        {
          label: 'Protein',
          data: weeklyData.map(day => day.protein),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          fill: true,
        },
        {
          label: 'Carbs',
          data: weeklyData.map(day => day.carbs),
          borderColor: 'rgb(255, 206, 86)',
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          fill: true,
        }
      ]
    };
  };

  // Add this function to your component
  const fetchWeeklySummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/diet/weekly-summary`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch weekly data');
      const data = await response.json();
      setWeeklyData(data);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Diet Tracking</h2>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
            </button>
          </div>

          {/* Add Meal Form */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Meal</h3>
            <form onSubmit={handleAddMeal} className="flex gap-4 flex-wrap">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search food"
                  value={newMeal.foodName}
                  onChange={(e) => {
                    setNewMeal(prev => ({...prev, foodName: e.target.value}));
                    handleFoodSearch(e.target.value);
                  }}
                  className="w-full p-2 rounded-md bg-black/30 border border-gray-700 text-white"
                  required
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(food => (
                      <div
                        key={food}
                        className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                        onClick={() => {
                          setNewMeal(prev => ({...prev, foodName: food}));
                          setSearchResults([]);
                        }}
                      >
                        {food}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="w-32">
                <input
                  type="number"
                  placeholder="Quantity (g)"
                  value={newMeal.quantity}
                  onChange={(e) => setNewMeal(prev => ({...prev, quantity: e.target.value}))}
                  className="w-full p-2 rounded-md bg-black/30 border border-gray-700 text-white"
                  required
                  min="1"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                disabled={!newMeal.foodName || !newMeal.quantity}
              >
                Add Meal
              </button>
            </form>
          </div>

          {/* Today's Meals Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Today's Meals</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total Calories: <span className="font-semibold text-primary-500">{dailyTotals.calories.toFixed(0)}</span>
              </div>
            </div>
            
            {meals.length === 0 ? (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 text-center">
                <div className="text-gray-400 mb-2">No meals added yet</div>
                <div className="text-sm text-gray-500">Start by adding your first meal above</div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {meals.map(meal => (
                  <div 
                    key={meal.id} 
                    className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-xl overflow-hidden border border-gray-200/20 hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-lg text-white capitalize">
                          {meal.foodName}
                        </h4>
                        <span className="bg-primary-500/20 text-primary-400 text-sm px-2 py-1 rounded-full">
                          {meal.calories.toFixed(0)} kcal
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-400 mb-4">
                        Quantity: {meal.quantity}g
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Protein</span>
                            <span className="text-white font-medium">{meal.protein.toFixed(1)}g</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Carbs</span>
                            <span className="text-white font-medium">{meal.carbs.toFixed(1)}g</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Fats</span>
                            <span className="text-white font-medium">{meal.fats.toFixed(1)}g</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Fiber</span>
                            <span className="text-white font-medium">{meal.fiber.toFixed(1)}g</span>
                          </div>
                        </div>
                      </div>

                      {/* Nutrition Bars */}
                      <div className="mt-4 space-y-2">
                        <div className="w-full bg-gray-700/30 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${(meal.protein / (meal.protein + meal.carbs + meal.fats)) * 100}%` }}
                          />
                        </div>
                        <div className="w-full bg-gray-700/30 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${(meal.carbs / (meal.protein + meal.carbs + meal.fats)) * 100}%` }}
                          />
                        </div>
                        <div className="w-full bg-gray-700/30 rounded-full h-1.5">
                          <div 
                            className="bg-yellow-500 h-1.5 rounded-full" 
                            style={{ width: `${(meal.fats / (meal.protein + meal.carbs + meal.fats)) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>Added at {new Date(meal.date).toLocaleTimeString()}</span>
                          <button 
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            title="Delete meal"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Analysis Section */}
          {showAnalysis && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Nutrition Analysis</h3>
                <div className="flex gap-4">
                  <select
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className="bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <select
                    value={chartType}
                    onChange={(e) => setChartType(e.target.value)}
                    className="bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                    <option value="pie">Pie Chart</option>
                  </select>
                </div>
              </div>

              <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6">
                {chartType === 'pie' ? (
                  <Pie data={getChartData()} options={chartOptions} />
                ) : chartType === 'bar' ? (
                  <Bar data={getChartData()} options={chartOptions} />
                ) : (
                  <Line data={getChartData()} options={chartOptions} />
                )}
              </div>

              {/* Daily Summary */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl p-4 text-white">
                  <h4 className="text-lg font-semibold">Calories</h4>
                  <p className="text-2xl">{dailyTotals.calories.toFixed(0)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-4 text-white">
                  <h4 className="text-lg font-semibold">Protein</h4>
                  <p className="text-2xl">{dailyTotals.protein.toFixed(0)}g</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-4 text-white">
                  <h4 className="text-lg font-semibold">Carbs</h4>
                  <p className="text-2xl">{dailyTotals.carbs.toFixed(0)}g</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 text-white">
                  <h4 className="text-lg font-semibold">Fats</h4>
                  <p className="text-2xl">{dailyTotals.fats.toFixed(0)}g</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4 text-white">
                  <h4 className="text-lg font-semibold">Fiber</h4>
                  <p className="text-2xl">{dailyTotals.fiber.toFixed(0)}g</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
    </div>
  );
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    }
  },
  scales: {
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)'
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)'
      }
    }
  }
}; 