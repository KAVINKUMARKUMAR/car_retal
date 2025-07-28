import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

function PaymentForm({ bookingId, amount }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    const payload = {
      booking: bookingId,
      amount: amount,
      payment_method: paymentMethod,
    };

    axiosInstance.post('payments/', payload)
      .then(res => {
        setStatusMessage('Payment successful!');
        setLoading(false);
      })
      .catch(() => {
        setStatusMessage('Payment failed.');
        setLoading(false);
      });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="paymentMethod" className="mb-3">
        <Form.Label>Payment Method</Form.Label>
        <Form.Control 
          type="text" 
          value={paymentMethod} 
          onChange={(e) => setPaymentMethod(e.target.value)} 
          required
        />
      </Form.Group>
      <Button disabled={loading} variant="primary" type="submit">
        {loading ? <Spinner animation="border" size="sm" /> : "Pay Now"}
      </Button>
      {statusMessage && <Alert className="mt-3" variant="info">{statusMessage}</Alert>}
    </Form>
  );
}

export default PaymentForm;
