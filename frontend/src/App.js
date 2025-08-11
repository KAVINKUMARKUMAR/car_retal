import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';
import CarHome from './components/CarHome';
import CarsList from './components/CarsList';
import CarDetailPage from "./components/CarDetailPage";
import BookingConfirmation from "./components/BookingConfirmation";


function App() {
  const TOKEN_KEY = 'accessToken';

  // Track authentication status using localStorage token presence
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem(TOKEN_KEY));

  // Listen for changes in localStorage (login/logout from other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem(TOKEN_KEY));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handler for successful login
  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  // Handler for logout - clears token and updates state
  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Landing route redirects based on authentication */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />
          }
        />
        {/* Login route: shows Login or redirects to home if authenticated */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />
          }
        />
        <Route path="/cars-list" element={<CarsList />} />
        {/* Register route: shows Register or redirects if authenticated */}
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Register />
          }
        />
        {/* Home page: CarHome component for authenticated users */}
        <Route
          path="/home"
          element={
            isAuthenticated ? <CarHome onLogout={handleLogout} /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/booking" element={<BookingConfirmation />} />
        <Route path="/cardetail/:id" element={<CarDetailPage />} />
        {/* Redirect unknown routes based on authentication */}
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
