import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const navItems = [
    { name: 'Diet Tracking', path: '/diet-track' },
    { name: 'Rehabilitation', path: '/rehabilitation', className: 'text-base' },
    { name: 'Analysis', path: '/analysis' },
    { name: 'Support', path: '/support' },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-500">
                FitLife Pro
              </span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-500 ${item.className || ''}`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500"
            >
              {isDarkMode ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div className="flex space-x-4">
                  <Link
                    to="/profile"
                    className="text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-500"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="ml-3 relative">
                <div className="flex space-x-4">
                  <Link
                    to="/signin"
                    className="text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-500"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-500"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {isAuthenticated && navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block pl-3 pr-4 py-2 text-base font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-500 ${item.className || ''}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
} 