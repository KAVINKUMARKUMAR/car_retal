import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function LoginPage({ onLogin }) {
  // State for login form inputs and UI feedback
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const styles = {
    container: { maxWidth: "400px", margin: "auto", padding: "1em" },
    inputGroup: { marginBottom: "1em" },
    label: { display: "block", marginBottom: "0.3em" },
    input: { width: "100%", padding: "8px", boxSizing: "border-box" },
    error: {
      color: "red",
      marginBottom: "1em",
      fontWeight: "bold",
      whiteSpace: "pre-wrap",
    },
    button: {
      width: "100%",
      padding: "10px",
      backgroundColor: "#1976d2",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      fontSize: "1em",
      cursor: "pointer",
    },
    buttonDisabled: {
      cursor: "not-allowed",
    },
    registerLinkContainer: {
      marginTop: "1em",
      textAlign: "center",
    },
    registerLink: {
      color: "#1976d2",
      textDecoration: "none",
      fontWeight: "bold",
      cursor: "pointer",
    },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Basic client-side validation
    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        setError("Invalid server response format.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const errMsg = data?.detail || JSON.stringify(data) || `Error: ${response.status}`;
        setError(errMsg);
        setLoading(false);
        return;
      }

      if (!data || !data.access) {
        setError("Login failed: no access token received.");
        setLoading(false);
        return;
      }

      // Store access token and update auth state
      localStorage.setItem("accessToken", data.access);
      onLogin();

      // Show login success alert (consider replacing with toast notification)
      alert("Login success");

      setLoading(false);
      navigate("/home");
    } catch (error) {
      console.error("Login fetch error:", error);
      if (error instanceof TypeError) {
        setError("Network error, please check your connection or backend server.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={styles.container}>
      <h2>Login</h2>

      <form onSubmit={handleLogin} noValidate>
        <div style={styles.inputGroup}>
          <label htmlFor="username" style={styles.label}>
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            autoFocus
            disabled={loading}
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
            style={styles.input}
          />
        </div>

        {error && (
          <div className="error-message" role="alert" style={styles.error}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
          aria-busy={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Register navigation link */}
      <div style={styles.registerLinkContainer}>
        <p>
          Don't have an account?{" "}
          <Link to="/register" style={styles.registerLink}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
