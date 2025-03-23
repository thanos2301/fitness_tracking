import React, { useState } from 'react';
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
  const [timeframe, setTimeframe] = useState('weekly');
  const [activeTab, setActiveTab] = useState('overview');

  // Rehabilitation Data
  const rehabProgressData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Rehabilitation Progress',
        data: [20, 40, 60, 80],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  const rehabMetricsData = {
    labels: ['Flexibility', 'Strength', 'Endurance', 'Balance'],
    datasets: [
      {
        label: 'Metrics',
        data: [65, 59, 80, 81],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  const calorieData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Calories Consumed',
        data: [2000, 2100, 1800, 2200, 2300, 1900, 2000],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
        fill: true
      }
    ]
  };

  const nutrientComplianceData = {
    labels: ['Protein', 'Carbs', 'Fats', 'Fiber'],
    datasets: [
      {
        label: 'Nutrient Compliance',
        data: [75, 85, 60, 90],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const macroData = {
    labels: ['Protein', 'Carbs', 'Fats'],
    datasets: [
      {
        label: 'Macro Distribution',
        data: [30, 50, 20],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

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

  const radarOptions = {
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
      r: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Analysis</h2>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'overview' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'nutrition' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
            >
              Nutrition
            </button>
            <button
              onClick={() => setActiveTab('rehabilitation')}
              className={`px-4 py-2 rounded-lg ${activeTab === 'rehabilitation' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}
            >
              Rehabilitation
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Rehabilitation Progress</h2>
                <div className="h-[300px]">
                  <Line data={rehabProgressData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Calorie Tracking</h2>
                <div className="h-[300px]">
                  <Bar data={calorieData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rehabilitation' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Rehabilitation Progress</h2>
                <div className="h-[300px]">
                  <Line data={rehabProgressData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Rehabilitation Metrics</h2>
                <div className="h-[300px]">
                  <Radar data={rehabMetricsData} options={radarOptions} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Calorie Tracking</h2>
                <div className="h-[300px]">
                  <Line data={calorieData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Nutrient Compliance</h2>
                <div className="h-[300px]">
                  <Radar data={nutrientComplianceData} options={radarOptions} />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Macro Distribution</h2>
                <div className="h-[300px]">
                  <Doughnut data={macroData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 