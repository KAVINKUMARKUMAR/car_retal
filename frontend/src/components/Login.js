import React, { useState } from 'react';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage(''); // clear previous messages on input change
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Trim inputs before sending to backend
    const trimmedData = {
      username: formData.username.trim(),
      password: formData.password.trim(),
    };

    axios
      .post('http://localhost:8000/api/login/', trimmedData)
      .then((res) => {
        setMessage(res.data.message);
        // Optionally clear inputs on success
        // setFormData({ username: '', password: '' });
      })
      .catch((err) => {
        setMessage('Error: ' + JSON.stringify(err.response?.data || err.message));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
        autoComplete="username"
        disabled={loading}
        aria-label="Username"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
        autoComplete="current-password"
        disabled={loading}
        aria-label="Password"
      />
      <button type="submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default Login;
