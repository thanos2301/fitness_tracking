import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDumbbell, FaHeartbeat, FaAppleAlt, FaBrain } from 'react-icons/fa';

export default function Landing() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: <FaDumbbell className="text-4xl text-primary-500" />,
      title: "Personalized Workouts",
      description: "Get custom exercise plans tailored to your fitness goals and level.",
      delay: 0.2
    },
    {
      icon: <FaHeartbeat className="text-4xl text-primary-500" />,
      title: "Health Tracking",
      description: "Monitor your progress with detailed health and fitness metrics.",
      delay: 0.4
    },
    {
      icon: <FaAppleAlt className="text-4xl text-primary-500" />,
      title: "Nutrition Guidance",
      description: "Access personalized meal plans and nutrition tracking tools.",
      delay: 0.6
    },
    {
      icon: <FaBrain className="text-4xl text-primary-500" />,
      title: "AI Support",
      description: "Get instant answers to your fitness and nutrition questions.",
      delay: 0.8
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 z-0">
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 0% 0%, #4F46E5 0%, transparent 50%)',
                'radial-gradient(circle at 100% 100%, #4F46E5 0%, transparent 50%)',
                'radial-gradient(circle at 0% 100%, #4F46E5 0%, transparent 50%)',
                'radial-gradient(circle at 100% 0%, #4F46E5 0%, transparent 50%)',
              ]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600">
              Transform Your Life with FitLife Pro
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Your all-in-one fitness companion powered by AI. Track workouts, monitor nutrition, and achieve your health goals.
            </p>
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/signup"
                className="px-8 py-4 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transform hover:scale-105 transition-all duration-300"
              >
                Get Started Free
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transform hover:scale-105 transition-all duration-300"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Why Choose FitLife Pro?</h2>
          <p className="text-gray-400 text-lg">Experience the future of fitness with our cutting-edge features</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300 transform hover:scale-105"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gray-800/50 backdrop-blur-lg py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Users" },
              { number: "500+", label: "Workout Plans" },
              { number: "1M+", label: "Meals Tracked" },
              { number: "98%", label: "Satisfaction" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-primary-500 mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <div className="relative overflow-hidden py-24">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, #4F46E5 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, #4F46E5 0%, transparent 70%)',
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-8">Ready to Start Your Fitness Journey?</h2>
            <Link
              to="/signup"
              className="inline-block px-8 py-4 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transform hover:scale-105 transition-all duration-300"
            >
              Join FitLife Pro Today
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 