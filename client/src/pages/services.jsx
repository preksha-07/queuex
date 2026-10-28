
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../App.css';

const categoryInfo = {
  healthcare: {
    title: 'Healthcare Services',
    subtitle: 'Find the care you need, join the queue, and track your position.',
    keywords: ['health', 'doctor', 'medical', 'dental', 'diagnostic', 'consultation'],
  },
  'administrative-services': {
    title: 'Administrative Services',
    subtitle: 'Choose an administrative service and reduce unnecessary waiting.',
    keywords: ['administrative', 'office', 'document', 'college', 'admission'],
  },
  'campus-facilities': {
    title: 'Campus Facilities',
    subtitle: 'Explore campus facilities and plan your visit.',
    keywords: ['campus', 'library', 'canteen', 'facility', 'food'],
  },
};

function getServiceIcon(name = '') {
  const value = name.toLowerCase();

  if (value.includes('dental')) return 'fa-tooth';
  if (value.includes('diagnostic') || value.includes('lab')) return 'fa-flask';
  if (value.includes('doctor') || value.includes('health') || value.includes('consultation')) {
    return 'fa-stethoscope';
  }
  if (value.includes('library')) return 'fa-book-open';
  if (value.includes('canteen') || value.includes('food')) return 'fa-utensils';
  if (value.includes('office') || value.includes('administrative')) {
    return 'fa-building-columns';
  }

  return 'fa-calendar-check';
}

function Services() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const currentCategory = categoryInfo[category];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError('');

        
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/services`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load services.');
        }

        setServices(Array.isArray(data) ? data : data.services || []);
      } catch (err) {
        setError(err.message || 'Could not connect to the backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const categoryServices = currentCategory
    ? services.filter((service) => {
        const searchable = `${service.name} ${service.description || ''}`.toLowerCase();
        return currentCategory.keywords.some((keyword) =>
          searchable.includes(keyword)
        );
      })
    : [];

  const handleBooking = async () => {
    const token = localStorage.getItem('queuexToken');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingMessage('');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/queue/join/${selectedService._id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not join the queue.');
      }

      setBookingMessage(
        `Success! Your token number is ${data.tokenNumber ?? data.entry?.tokenNumber ?? 'assigned'}. Check My Queue to track your position.`
      );
    } catch (err) {
      setBookingMessage(err.message || 'Something went wrong.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (!currentCategory) {
    return (
      <main className="services-page">
        <nav className="services-navbar">
          <Link to="/" className="logo">
            queue<span className="logo-highlight">x</span>
          </Link>
          <Link to="/" className="back-home">
            <i className="fa-solid fa-arrow-left"></i> Back to Home
          </Link>
        </nav>

        <section className="services-hero">
          <h1>Category not found</h1>
          <p>Please return home and select a valid service category.</p>
          <Link to="/" className="primary-button">Back to Home</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="services-page">
      <nav className="services-navbar">
        <Link to="/" className="logo">
          queue<span className="logo-highlight">x</span>
        </Link>
        <Link to="/" className="back-home">
          <i className="fa-solid fa-arrow-left"></i> Back to Home
        </Link>
      </nav>

      <section className="services-hero">
        <span className="section-label">EXPLORE YOUR OPTIONS</span>
        <h1>{currentCategory.title}</h1>
        <p>{currentCategory.subtitle}</p>
      </section>

      <section className="college-services">
        <div className="section-heading">
          <div>
            <span className="section-label">AVAILABLE SERVICES</span>
            <h2>Where would you like to go?</h2>
            <p>Choose a service to join its live queue.</p>
          </div>
        </div>

        {loading && <p>Loading services from QUEUEX...</p>}

        {!loading && error && (
          <p className="auth-message error" role="alert">{error}</p>
        )}

        {!loading && !error && categoryServices.length === 0 && (
          <p>No services are available in this category yet.</p>
        )}

        <div className="service-grid">
          {categoryServices.map((service) => (
            <article className="service-card" key={service._id}>
              <div className="service-icon">
                <i className={`fa-solid ${getServiceIcon(service.name)}`}></i>
              </div>

              <span className="service-tag">
                {currentCategory.title.toUpperCase()}
              </span>

              <h3>{service.name}</h3>
              <p>{service.description || 'Choose this service to join its queue.'}</p>

              <div className="queue-status">
                <span className="queue-status-dot"></span>
                <div>
                  <strong>Live queue available</strong>
                  <p>Join the queue to receive your token.</p>
                </div>
              </div>

              <p className="service-duration">
                <i className="fa-regular fa-clock"></i>
                {' '}{service.averageServiceTime} minutes per service
              </p>

              <button
                type="button"
                className="primary-button service-link"
                onClick={() => {
                  setSelectedService(service);
                  setBookingMessage('');
                }}
              >
                Join queue <i className="fa-solid fa-arrow-right"></i>
              </button>
            </article>
          ))}
        </div>
      </section>

      {selectedService && (
        <section className="booking-panel" aria-live="polite">
          <button
            type="button"
            className="booking-close"
            onClick={() => {
              setSelectedService(null);
              setBookingMessage('');
            }}
            aria-label="Close queue panel"
          >
            ×
          </button>

          <span className="section-label">QUEUE REGISTRATION</span>
          <h2>{selectedService.name}</h2>
          <p>{selectedService.description}</p>

          <div className="queue-status">
            <span className="queue-status-dot"></span>
            <div>
              <strong>Ready to join?</strong>
              <p>Your token will be assigned by the backend.</p>
            </div>
          </div>

          {bookingMessage && (
            <p className="auth-message" role="status">{bookingMessage}</p>
          )}

          <button
            type="button"
            className="primary-button"
            onClick={handleBooking}
            disabled={bookingLoading}
          >
            {bookingLoading ? 'Joining queue...' : 'Confirm and join queue'}
            {!bookingLoading && <i className="fa-solid fa-arrow-right"></i>}
          </button>
        </section>
      )}
    </main>
  );
}

export default Services;
