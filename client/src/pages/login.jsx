
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });

    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      // Save the JWT and logged-in user information.
      localStorage.setItem('queuexToken', data.token);
      localStorage.setItem('queuexUser', JSON.stringify(data.user));

      navigate('/');
    } catch (error) {
      setMessage(
        error.message || 'Unable to connect to the server. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a href="/" className="auth-logo">
          queue<span>x</span>
        </a>

        <div className="auth-heading">
          <span className="section-label">WELCOME BACK</span>

          <h1>Good to see you again!</h1>

          <p>
            Log in to make your next visit a little easier.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="login-email">Email address</label>

          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="login-password">Password</label>

          <input
            id="login-password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
            {!loading && <i className="fa-solid fa-arrow-right"></i>}
          </button>

          {message && (
            <p className="auth-message" role="alert">
              {message}
            </p>
          )}
        </form>

        <p className="auth-switch">
          New to QUEUEX?{' '}
          <a href="/register">Create an account</a>
        </p>

        <a href="/" className="back-home">
          <i className="fa-solid fa-arrow-left"></i>
          {' '}Back to home
        </a>
      </section>
    </main>
  );
}

export default Login;