
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Provider() {
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('queuexToken');
  const user = JSON.parse(localStorage.getItem('queuexUser') || '{}');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (!['PROVIDER', 'ADMIN'].includes(user.role)) {
      setError('Access denied. This page is for providers and admins.');
      return;
    }

    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/services');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load services.');
      }

      setServices(data);

      if (data.length > 0) {
        setSelectedService(data[0]._id);
        await loadQueue(data[0]._id);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadQueue = async (serviceId) => {
    if (!serviceId) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/queue/service/${serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load the queue.');
      }

      setEntries(Array.isArray(data) ? data : data.entries || []);
    } catch (err) {
      setError(err.message);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const callNext = async () => {
    if (!selectedService) return;

    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/queue/service/${selectedService}/next`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not call the next token.');
      }

      setMessage(data.message || 'Next token called successfully!');
      await loadQueue(selectedService);
    } catch (err) {
      setError(err.message);
    }
  };

  const markServed = async (entryId) => {
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/queue/${entryId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'SERVED' }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not mark token as served.');
      }

      setMessage('Token marked as served!');
      await loadQueue(selectedService);
    } catch (err) {
      setError(err.message);
    }
  };

  const changeService = (serviceId) => {
    setSelectedService(serviceId);
    setMessage('');
    loadQueue(serviceId);
  };

  const styles = {
    page: {
      minHeight: '100vh',
      background: '#f5f7fb',
      padding: '35px 20px',
      fontFamily: 'Arial, sans-serif',
      color: '#1f2937',
    },
    container: {
      maxWidth: '1000px',
      margin: '0 auto',
    },
    card: {
      background: '#fff',
      borderRadius: '14px',
      padding: '22px',
      marginBottom: '18px',
      boxShadow: '0 3px 15px rgba(0,0,0,0.06)',
    },
    button: {
      background: '#4f46e5',
      color: '#fff',
      border: 0,
      borderRadius: '8px',
      padding: '11px 16px',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button
          style={{ ...styles.button, marginBottom: '20px' }}
          onClick={() => navigate('/')}
        >
          ← Home
        </button>

        <h1>Provider Dashboard</h1>
        <p>Manage your service queue and call the next token.</p>

        {error && (
          <p style={{ color: '#b91c1c', background: '#fee2e2', padding: '12px', borderRadius: '8px' }}>
            {error}
          </p>
        )}

        {message && (
          <p style={{ color: '#065f46', background: '#d1fae5', padding: '12px', borderRadius: '8px' }}>
            {message}
          </p>
        )}

        {['PROVIDER', 'ADMIN'].includes(user.role) && (
          <>
            <div style={styles.card}>
              <label htmlFor="service-select">
                <strong>Select service</strong>
              </label>

              <select
                id="service-select"
                value={selectedService}
                onChange={(e) => changeService(e.target.value)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px',
                  marginTop: '10px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                }}
              >
                {services.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name}
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
                <button style={styles.button} onClick={callNext}>
                  Call Next Token
                </button>

                <button
                  style={{ ...styles.button, background: '#374151' }}
                  onClick={() => loadQueue(selectedService)}
                >
                  Refresh Queue
                </button>
              </div>
            </div>

            <h2>Today's Queue ({entries.length})</h2>

            {loading ? (
              <p>Loading queue...</p>
            ) : entries.length === 0 ? (
              <div style={styles.card}>
                No waiting or called customers for this service.
              </div>
            ) : (
              entries.map((entry) => (
                <div key={entry._id} style={styles.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ marginTop: 0 }}>
                        Token #{entry.tokenNumber}
                      </h3>
                      <p>
                        Customer: {entry.user?.name || 'Customer'}
                      </p>
                      <p>
                        Status: <strong>{entry.status}</strong>
                      </p>
                    </div>

                    {entry.status === 'CALLED' && (
                      <button
                        style={{ ...styles.button, background: '#059669', alignSelf: 'center' }}
                        onClick={() => markServed(entry._id)}
                      >
                        Mark Served
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Provider;