import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
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

    if (formData.password !== formData.confirmPassword) {
      setMessage('Your passwords do not match. Please try again.');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.');
      }

      setMessage('Account created successfully! Redirecting to login...');
      setMessageType('success');

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      setMessage(
        error.message ||
          'Unable to connect to the server. Please try again.'
      );
      setMessageType('error');
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
          <span className="section-label">YOUR TIME MATTERS</span>

          <h1>Let's get you started.</h1>

          <p>
            Create your account and make waiting a little easier.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="register-name">Full name</label>

          <input
            id="register-name"
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="register-email">Email address</label>

          <input
            id="register-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="register-password">Password</label>

          <input
            id="register-password"
            type="password"
            name="password"
            placeholder="Create a password"
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            required
          />

          <label htmlFor="confirm-password">Confirm password</label>

          <input
            id="confirm-password"
            type="password"
            name="confirmPassword"
            placeholder="Enter your password again"
            minLength={6}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
            {!loading && <i className="fa-solid fa-arrow-right"></i>}
          </button>

          {message && (
            <p
              className={`auth-message ${messageType}`}
              role="status"
            >
              {message}
            </p>
          )}
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <a href="/login">Log in</a>
        </p>

        <a href="/" className="back-home">
          <i className="fa-solid fa-arrow-left"></i>
          {' '}Back to home
        </a>
      </section>
    </main>
  );
}

export default Register;
