
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem('queuexUser') || 'null');
    } catch {
      return null;
    }
  };

  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem('queuexToken'))
  );
  const [user, setUser] = useState(getStoredUser);

  useEffect(() => {
    const updateLoginState = () => {
      setIsLoggedIn(Boolean(localStorage.getItem('queuexToken')));
      setUser(getStoredUser());
    };

    window.addEventListener('focus', updateLoginState);
    window.addEventListener('storage', updateLoginState);

    return () => {
      window.removeEventListener('focus', updateLoginState);
      window.removeEventListener('storage', updateLoginState);
    };
  }, []);

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src =
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=85';
  };

  const handleLogout = () => {
    localStorage.removeItem('queuexToken');
    localStorage.removeItem('queuexUser');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  const role = user?.role?.toUpperCase();

  return (
    <div className="app">
      <nav className="navbar" aria-label="Main navigation">
        <Link to="/" className="logo" aria-label="QUEUEX home">
          <span className="logo-icon">
            <i className="fa-solid fa-ticket"></i>
          </span>
          <span>queue<span className="logo-highlight">x</span></span>
        </Link>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#how-it-works">How it works</a>
        </div>

        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              {role === 'USER' && (
                <Link to="/my-queue" className="login-link">
                  My Queue
                </Link>
              )}

              {(role === 'PROVIDER' || role === 'ADMIN') && (
                <Link to="/provider" className="login-link">
                  Provider Dashboard
                </Link>
              )}

              {role === 'ADMIN' && (
                <Link to="/admin" className="login-link">
                  Admin Dashboard
                </Link>
              )}

              <button
                type="button"
                className="login-link"
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                Log out
              </button>

              {role === 'USER' && (
                <Link to="/my-queue" className="nav-button">
                  View my tokens
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              )}

              {role === 'PROVIDER' && (
                <Link to="/provider" className="nav-button">
                  Open dashboard
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              )}

              {role === 'ADMIN' && (
                <Link to="/admin" className="nav-button">
                  Open dashboard
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="login-link">
                Log in
              </Link>

              <Link to="/register" className="nav-button">
                Get started
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </>
          )}
        </div>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="live-dot"></span>
              YOUR TIME MATTERS
            </div>

            <h1>
              Less waiting.
              <br />
              <span>More living.</span>
            </h1>

            <p className="hero-description">
              Your day is too precious to spend in a queue.
              Find a service, book your appointment, and get
              on with the things you love.
            </p>

            <div className="hero-actions">
              <a href="#services" className="primary-button">
                Explore services
                <i className="fa-solid fa-arrow-right"></i>
              </a>

              <a href="#how-it-works" className="secondary-button">
                <i className="fa-regular fa-circle-play"></i>
                How it works
              </a>
            </div>

            <div className="hero-note">
              <div className="avatar-stack" aria-hidden="true">
                <span>😊</span>
                <span>🌷</span>
                <span>✨</span>
              </div>
              <p>
                <strong>A little less waiting,</strong>
                <br />
                a lot more peace of mind.
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="decor decor-one"></div>
            <div className="decor decor-two"></div>

            <img
              className="hero-image"
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e71?auto=format&fit=crop&w=1000&q=85"
              alt="Bright, welcoming modern service space"
              onError={handleImageError}
            />

            <div className="floating-note note-top">
              <span className="note-icon mint">
                <i className="fa-solid fa-check"></i>
              </span>
              <div>
                <strong>Your time, protected.</strong>
                <p>Queue at your own pace</p>
              </div>
            </div>

            <div className="floating-note note-bottom">
              <span className="note-icon peach">
                <i className="fa-solid fa-heart"></i>
              </span>
              <div>
                <strong>Made for real life</strong>
                <p>Simple. Calm. Convenient.</p>
              </div>
            </div>

            <span className="sparkle sparkle-one" aria-hidden="true">✳</span>
            <span className="sparkle sparkle-two" aria-hidden="true">✦</span>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="section-heading">
            <div>
              <span className="section-label">YOUR CAMPUS, MADE SIMPLER</span>
              <h2>What can we help you with?</h2>
              <p>Manage appointments and queues across your college campus.</p>
            </div>
            <span className="heading-decoration" aria-hidden="true">✿</span>
          </div>

          <div className="service-grid">
            <article className="service-card card-lavender">
              <div className="service-icon">
                <i className="fa-solid fa-stethoscope"></i>
              </div>
              <span className="service-tag">HEALTH &amp; WELLNESS</span>
              <h3>Healthcare</h3>
              <p>
                Make your healthcare visit more organised.
                Explore available services and check waiting queues.
              </p>
              <Link to="/services/healthcare" className="service-link">
                Explore services <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </article>

            <article className="service-card card-mint">
              <div className="service-icon">
                <i className="fa-solid fa-building-columns"></i>
              </div>
              <span className="service-tag">COLLEGE ADMINISTRATION</span>
              <h3>Administrative Services</h3>
              <p>
                Book an appointment with the college Administrative
                Office and check the waiting queue.
              </p>
              <Link to="/services/administrative-services" className="service-link">
                Visit administrative services
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </article>

            <article className="service-card card-peach">
              <div className="service-icon">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <span className="service-tag">CAMPUS FACILITIES</span>
              <h3>Campus Facilities</h3>
              <p>
                Explore the Library and Canteen separately,
                with individual queue counts and appointment options.
              </p>
              <Link to="/services/campus-facilities" className="service-link">
                Explore campus facilities
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </article>
          </div>
        </section>

        <section className="how-section" id="how-it-works">
          <span className="section-label">THREE LITTLE STEPS</span>
          <h2>Queue smarter, not longer.</h2>

          <div className="steps-grid">
            <article className="step">
              <span className="step-number">01</span>
              <h3>Pick your service</h3>
              <p>Choose a healthcare service, the Administrative Office, or a campus facility.</p>
            </article>

            <article className="step">
              <span className="step-number">02</span>
              <h3>Join the queue</h3>
              <p>Get your token number and track your queue entry.</p>
            </article>

            <article className="step">
              <span className="step-number">03</span>
              <h3>Save your time</h3>
              <p>Check your queue status and plan your visit with less unnecessary waiting.</p>
            </article>
          </div>
        </section>

        <footer className="footer">
          <Link to="/" className="logo" aria-label="QUEUEX home">
            <span className="logo-icon">
              <i className="fa-solid fa-ticket"></i>
            </span>
            <span>queue<span className="logo-highlight">x</span></span>
          </Link>
          <p>Less waiting, more living. Made with care ♡</p>
          <span className="footer-copy">© 2026 QUEUEX</span>
        </footer>
      </main>
    </div>
  );
}

export default Home;
