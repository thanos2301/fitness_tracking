import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

export default function ProfileCheck({ children }) {
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        // Check if all required fields are filled
        const isComplete = data && data.name && data.gender && data.dob && 
                          data.country && data.height && data.weight;

        setIsProfileComplete(isComplete);
        
        if (!isComplete) {
          navigate('/profile', { 
            state: { 
              message: 'Please complete your profile to access this feature',
              returnPath: window.location.pathname
            }
          });
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return isProfileComplete ? children : (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <div className="text-center">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Please <Link to="/profile" className="text-primary-600 hover:text-primary-500">complete your profile</Link> to access this feature.
        </p>
      </div>
    </div>
  );
} 