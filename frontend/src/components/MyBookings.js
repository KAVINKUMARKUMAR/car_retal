import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { UserContext } from '../context/UserContext';
import { Table, Spinner, Alert } from 'react-bootstrap';

function MyBookings() {
  const { user } = useContext(UserContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    axiosInstance.get('bookings/')
      .then(res => {
        // Filter bookings by the logged-in user (customer)
        const userBookings = res.data.filter(b => b.customer === user.id);
        setBookings(userBookings);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch bookings.');
        setLoading(false);
      });
  }, [user]);

  if (!user) return <Alert variant="warning">Please login to view your bookings.</Alert>;
  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2>My Bookings</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Car</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Driver</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 && (
            <tr><td colSpan="5">No bookings found.</td></tr>
          )}
          {bookings.map(b => (
            <tr key={b.id}>
              <td>{b.car_brand} {b.car_model}</td> {/* Adjust based on API */}
              <td>{new Date(b.start_date).toLocaleString()}</td>
              <td>{new Date(b.end_date).toLocaleString()}</td>
              <td>{b.driver_name || 'None'}</td> {/* Adjust based on API */}
              <td>{b.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default MyBookings;
