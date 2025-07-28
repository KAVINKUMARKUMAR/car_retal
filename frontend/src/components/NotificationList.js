import React, { useEffect, useState, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { UserContext } from '../context/UserContext';
import { ListGroup, Spinner, Alert } from 'react-bootstrap';

function NotificationList() {
  const { user } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    axiosInstance.get('notifications/')
      .then(res => {
        setNotifications(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load notifications.');
        setLoading(false);
      });
  }, [user]);

  if (!user) return <Alert variant="warning">Please login to view notifications.</Alert>;
  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2>Notifications</h2>
      <ListGroup>
        {notifications.length === 0 && <ListGroup.Item>No notifications.</ListGroup.Item>}
        {notifications.map(n => (
          <ListGroup.Item 
            key={n.id} 
            variant={n.is_read ? 'light' : 'primary'}
          >
            <p>{n.message}</p>
            <small>{new Date(n.sent_at).toLocaleString()}</small>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}

export default NotificationList;
