import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import Rehabilitation from './components/Rehabilitation';
import ProtectedRoute from './components/ProtectedRoute';
import FormCheck from './components/FormCheck';
import DietTracking from './components/DietTracking';
import Support from './components/Support';
import RehabilitationResults from './components/RehabilitationResults';
import RehabilitationAssessment from './components/RehabilitationAssessment';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-white dark:bg-black transition-colors duration-200">
            <Navbar />
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route 
                path="/rehabilitation" 
                element={
                  <ProtectedRoute>
                    <Rehabilitation />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/form-check" 
                element={
                  <ProtectedRoute>
                    <FormCheck />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/diet-track" 
                element={
                  <ProtectedRoute>
                    <DietTracking />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/support" 
                element={
                  <ProtectedRoute>
                    <Support />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rehabilitation/assessment" 
                element={
                  <ProtectedRoute>
                    <RehabilitationAssessment />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rehabilitation/results" 
                element={
                  <ProtectedRoute>
                    <RehabilitationResults />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App; 