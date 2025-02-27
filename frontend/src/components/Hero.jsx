import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const { isAuthenticated } = useAuth();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const hasProfileUpdate = localStorage.getItem('profileUpdateSuccess');
    if (hasProfileUpdate) {
      setShowSuccessMessage(true);
      localStorage.removeItem('profileUpdateSuccess');

      // Hide the message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black overflow-hidden flex flex-col">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in-down">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Background overlay with fitness image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Welcome to</span>
              <span className="block text-primary-500">FitLife Pro</span>
            </h1>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Transform your health journey with <span className="font-semibold">FitLife Pro</span>. Whether you're recovering from an injury or working towards your fitness goals, access personalized rehabilitation programs, real-time form checks, and customized diet tracking. Join a supportive community that caters to everyone, from individuals in recovery to fitness enthusiasts.
            </p>
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <Link 
                  to={isAuthenticated ? "/rehabilitation" : "/signin"} 
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition duration-150"
                >
                  Start Recovery
                </Link>
              </div>
              {!isAuthenticated && (
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link to="/signup" className="w-full flex items-center justify-center px-8 py-3 border-2 border-primary-500 text-base font-medium rounded-md text-primary-500 bg-transparent hover:bg-primary-500 hover:text-white md:py-4 md:text-lg md:px-10 transition duration-150">
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Features section with glassmorphism effect */}
            <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {/* Rehabilitation Programs */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 bg-black bg-opacity-40 backdrop-blur-sm rounded-lg border border-gray-800">
                  <div className="text-2xl font-bold text-primary-500 mb-2">
                    Rehabilitation Programs
                  </div>
                  <div className="text-sm text-gray-300">
                    Access expert-guided recovery plans tailored to your injury and recovery stage.
                  </div>
                </div>
              </div>

              {/* Form Check */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 bg-black bg-opacity-40 backdrop-blur-sm rounded-lg border border-gray-800">
                  <div className="text-2xl font-bold text-primary-500 mb-2">
                    Form Check
                  </div>
                  <div className="text-sm text-gray-300">
                    Ensure correct exercise techniques with real-time form analysis and feedback.
                  </div>
                </div>
              </div>

              {/* Diet Tracking & Support */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 bg-black bg-opacity-40 backdrop-blur-sm rounded-lg border border-gray-800">
                  <div className="text-2xl font-bold text-primary-500 mb-2">
                    Diet Tracking & Support
                  </div>
                  <div className="text-sm text-gray-300">
                    Track your meals, calories, and nutrition with personalized diet plans and expert guidance.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-gray-800 bg-white/30 dark:bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center sm:flex-row sm:justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-primary-500 font-bold text-xl">FitLife Pro</span>
              <span className="text-gray-400">©</span>
              <span className="text-gray-400">{new Date().getFullYear()}</span>
            </div>
            <div className="mt-4 sm:mt-0 text-gray-400 text-sm">
              All rights reserved. Crafted with passion for fitness enthusiasts.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 