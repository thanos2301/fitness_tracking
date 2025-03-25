import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { API_BASE_URL } from '../config/api';
import { format, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analysis() {
  const [dietData, setDietData] = useState({
    weeklyCalories: [],
    macroSummary: { protein: 0, carbs: 0, fat: 0 },
    averageCalories: 0
  });
  const [rehabData, setRehabData] = useState({
    exercises: [],
    painHistory: [],
    overallProgress: 0,
    currentPainLevel: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Please log in to view analysis');
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Test the rehabilitation endpoint first
        const testResponse = await fetch(`${API_BASE_URL}/rehabilitation/test`, { headers });
        console.log('Test response:', await testResponse.text());

        // Fetch actual data
        const [dietResponse, rehabResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/diet/weekly-summary`, { headers }),
          fetch(`${API_BASE_URL}/rehabilitation/progress`, { headers })
        ]);

        console.log('Diet response status:', dietResponse.status);
        console.log('Rehab response status:', rehabResponse.status);

        if (!dietResponse.ok) {
          console.warn('Diet data fetch failed:', await dietResponse.text());
        }

        if (!rehabResponse.ok) {
          console.warn('Rehabilitation data fetch failed:', await rehabResponse.text());
        }

        const [dietData, rehabData] = await Promise.all([
          dietResponse.ok ? dietResponse.json() : null,
          rehabResponse.ok ? rehabResponse.json() : null
        ]);

        if (dietData) setDietData(dietData);
        if (rehabData) setRehabData(rehabData);

        if (!dietData && !rehabData) {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Prepare data for charts
  const calorieData = {
    labels: dietData?.weeklyCalories?.map(day => format(new Date(day.date), 'EEE')) || [],
    datasets: [{
      label: 'Daily Calories',
      data: dietData?.weeklyCalories?.map(day => day.calories) || [],
      fill: true,
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4
    }]
  };

  const macroData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [{
      data: [
        dietData?.macroSummary?.protein || 0,
        dietData?.macroSummary?.carbs || 0,
        dietData?.macroSummary?.fat || 0
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 206, 86, 0.8)'
      ]
    }]
  };

  const rehabProgressData = {
    labels: rehabData?.exercises?.map(ex => ex.name) || [],
    datasets: [{
      label: 'Progress Score',
      data: rehabData?.exercises?.map(ex => ex.progressScore) || [],
      backgroundColor: 'rgba(153, 102, 255, 0.5)',
      borderColor: 'rgb(153, 102, 255)',
      borderWidth: 1
    }]
  };

  const painLevelData = {
    labels: rehabData?.painHistory?.map(entry => format(new Date(entry.date), 'MMM d')) || [],
    datasets: [{
      label: 'Pain Level',
      data: rehabData?.painHistory?.map(entry => entry.level) || [],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
      fill: true
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(160, 174, 192)'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(160, 174, 192, 0.1)'
        },
        ticks: {
          color: 'rgb(160, 174, 192)'
        }
      },
      x: {
        grid: {
          color: 'rgba(160, 174, 192, 0.1)'
        },
        ticks: {
          color: 'rgb(160, 174, 192)'
        }
      }
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Progress Analysis
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calorie Tracking */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Weekly Calorie Intake
            </h2>
            <div className="h-[300px]">
              <Line data={calorieData} options={chartOptions} />
            </div>
          </div>

          {/* Macro Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Macro Distribution
            </h2>
            <div className="h-[300px]">
              <Doughnut data={macroData} options={chartOptions} />
            </div>
          </div>

          {/* Rehabilitation Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Exercise Progress
            </h2>
            <div className="h-[300px]">
              <Bar data={rehabProgressData} options={chartOptions} />
            </div>
          </div>

          {/* Pain Level Tracking */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Pain Level History
            </h2>
            <div className="h-[300px]">
              <Line data={painLevelData} options={chartOptions} />
            </div>
          </div>

          {/* Summary Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Average Daily Calories
              </h3>
              <p className="text-3xl font-bold text-primary-600">
                {Math.round(dietData?.averageCalories || 0)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Rehabilitation Progress
              </h3>
              <p className="text-3xl font-bold text-primary-600">
                {Math.round(rehabData?.overallProgress || 0)}%
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Current Pain Level
              </h3>
              <p className="text-3xl font-bold text-primary-600">
                {rehabData?.currentPainLevel || 0}/10
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 