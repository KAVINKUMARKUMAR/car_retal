import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { Card, Button, Spinner, Alert } from 'react-bootstrap';
import { UserContext } from '../context/UserContext';

function CarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance.get(`cars/${id}/`)
      .then(res => {
        setCar(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch car details.');
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!car) return <Alert variant="warning">Car not found</Alert>;

  const handleBooking = () => {
    if (!user) {
      alert("You must be logged in to book a car.");
      return navigate('/login');
    }
    navigate(`/booking/${car.id}`);
  };

  return (
    <Card>
      <Card.Img variant="top" src={`http://localhost:8000${car.image}`} alt={car.model} />
      <Card.Body>
        <Card.Title>{car.brand} {car.model} ({car.year})</Card.Title>
        <Card.Text>
          <strong>Description:</strong> {car.description} <br />
          <strong>Registration Number:</strong> {car.registration_number} <br />
          <strong>Daily Rate:</strong> ₹{car.daily_rate} <br />
          <strong>Status:</strong> {car.status}
        </Card.Text>
        <Button variant="success" onClick={handleBooking} disabled={car.status !== "available"}>
          Book Now
        </Button>
        <Link to="/cars" className="btn btn-link">Back to Cars</Link>
      </Card.Body>
    </Card>
  );
}

export default CarDetail;
