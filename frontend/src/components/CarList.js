import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Link } from 'react-router-dom';
import { Card, Button, Spinner, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';

function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    axiosInstance.get('cars/')
      .then(res => {
        setCars(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching cars:', err);
        setError('Failed to load cars.');
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2>Available Cars</h2>
      <Row xs={1} md={3} className="g-4">
        {cars.map(car => (
          <Col key={car.id}>
            <Card>
              <Card.Img variant="top" src={`http://localhost:8000${car.image}`} alt={car.model} />
              <Card.Body>
                <Card.Title>{car.brand} {car.model}</Card.Title>
                <Card.Text>
                  Rate: ₹{car.daily_rate} / day <br />
                  Status: {car.status}
                </Card.Text>
                <Link to={`/cars/${car.id}`}>
                  <Button variant="primary">View Details</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default CarList;
