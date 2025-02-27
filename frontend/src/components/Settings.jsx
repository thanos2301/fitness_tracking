import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black overflow-hidden">
      <div className="relative z-10 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 dark:bg-black/30 backdrop-blur-md shadow-xl rounded-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Settings</h2>

            <div className="space-y-6">
              {/* Theme Toggle Section */}
              <div className="bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                  <button
                    onClick={toggleTheme}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">Toggle theme</span>
                    <span
                      className={`${
                        isDarkMode ? 'translate-x-6 bg-primary-500' : 'translate-x-1 bg-white'
                      } inline-block h-4 w-4 transform rounded-full transition-transform`}
                    />
                  </button>
                </div>
              </div>

              {/* Other settings sections can be added here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 