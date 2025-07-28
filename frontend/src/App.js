import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import axiosInstance from './utils/axiosInstance';

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import CarList from './components/CarList';
import CarDetail from './components/CarDetail';
import BookingForm from './components/BookingForm';
import MyBookings from './components/MyBookings';
import PaymentForm from './components/PaymentForm';
import NotificationList from './components/NotificationList';

import 'bootstrap/dist/css/bootstrap.min.css';

import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate replace to="/cars" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cars" element={<CarList />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/booking/:carId" element={<BookingForm />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/payment/:bookingId" element={<PaymentFormWrapper />} />
          <Route path="/notifications" element={<NotificationList />} />
          <Route path="*" element={<p>Page Not Found</p>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

function PaymentFormWrapper() {
  const { bookingId } = useParams();
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance.get(`bookings/${bookingId}/`)
      .then(res => {
        setAmount(res.data.total_cost);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load booking details.');
        setLoading(false);
      });
  }, [bookingId]);

  if (loading) return <p>Loading payment details...</p>;
  if (error) return <p>{error}</p>;

  return <PaymentForm bookingId={bookingId} amount={amount} />;
}

export default App;
