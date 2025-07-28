import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';

function BookingForm() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [driverId, setDriverId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!user) {
    return <Alert variant="danger">You must be logged in to book a car.</Alert>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      customer: user.id,
      car: parseInt(carId),
      driver: driverId || null,
      start_date: startDate,
      end_date: endDate,
    };

    axiosInstance.post('bookings/', payload)
      .then(res => {
        setSuccessMsg("Booking successful!");
        setLoading(false);
        // Could redirect to MyBookings or payment page
        navigate('/my-bookings');
      })
      .catch(err => {
        setError("Booking failed.");
        setLoading(false);
      });
  };

  return (
    <div>
      <h2>Book Car</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="startDate" className="mb-3">
          <Form.Label>Start Date & Time</Form.Label>
          <Form.Control 
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="endDate" className="mb-3">
          <Form.Label>End Date & Time</Form.Label>
          <Form.Control 
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="driverId" className="mb-3">
          <Form.Label>Driver (Optional)</Form.Label>
          <Form.Control 
            type="text"
            placeholder="Driver ID"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
          />
          <Form.Text className="text-muted">You can enter driver ID or leave blank.</Form.Text>
        </Form.Group>

        {error && <Alert variant="danger">{error}</Alert>}
        {successMsg && <Alert variant="success">{successMsg}</Alert>}

        <Button disabled={loading} variant="primary" type="submit">
          {loading ? <Spinner animation="border" size="sm" /> : "Book Now"}
        </Button>
      </Form>
    </div>
  );
}

export default BookingForm;
