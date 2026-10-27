
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MyQueue() {
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchQueue = async () => {
    const token = localStorage.getItem('queuexToken');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'http://localhost:5000/api/queue/my',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('queuexToken');
          localStorage.removeItem('queuexUser');
          navigate('/login');
          return;
        }

        throw new Error(data.message || 'Could not load your queue.');
      }

      setEntries(Array.isArray(data) ? data : data.entries || []);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const cancelEntry = async (entryId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this queue entry?'
    );

    if (!confirmed) return;

    const token = localStorage.getItem('queuexToken');

    try {
      setError('');
      setMessage('');

      const response = await fetch(
        `http://localhost:5000/api/queue/${entryId}/cancel`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not cancel your entry.');
      }

      setMessage('Queue entry cancelled successfully!');
      await fetchQueue();
    } catch (err) {
      setError(err.message || 'Could not cancel your entry.');
    }
  };

  if (loading) {
    return <div style={styles.page}>Loading your queue...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button
          style={styles.backButton}
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>

        <h1 style={styles.heading}>My Queue</h1>
        <p style={styles.subtitle}>
          Track your token and estimated waiting time.
        </p>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        {entries.length === 0 ? (
          <div style={styles.card}>
            <h3>No queue entries found</h3>
            <p>You haven't joined a queue today.</p>
            <button
              style={styles.button}
              onClick={() => navigate('/services/healthcare')}
            >
              Browse Services
            </button>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.serviceName}>
                  {entry.service?.name || 'Service'}
                </h2>

                <span
                  style={{
                    ...styles.status,
                    ...(entry.status === 'WAITING'
                      ? styles.waiting
                      : entry.status === 'CALLED'
                      ? styles.called
                      : entry.status === 'SERVED'
                      ? styles.served
                      : styles.cancelled),
                  }}
                >
                  {entry.status}
                </span>
              </div>

              <div style={styles.tokenBox}>
                <span style={styles.label}>Your Token Number</span>
                <strong style={styles.tokenNumber}>
                  {entry.tokenNumber}
                </strong>
              </div>

              <div style={styles.stats}>
                <div style={styles.stat}>
                  <span style={styles.label}>Queue Position</span>
                  <strong style={styles.statValue}>
                    {entry.status === 'WAITING'
                      ? entry.queuePosition ?? '—'
                      : '—'}
                  </strong>
                </div>

                <div style={styles.stat}>
                  <span style={styles.label}>People Ahead</span>
                  <strong style={styles.statValue}>
                    {entry.status === 'WAITING'
                      ? entry.peopleAhead ?? '—'
                      : '—'}
                  </strong>
                </div>

                <div style={styles.stat}>
                  <span style={styles.label}>Estimated Wait</span>
                  <strong style={styles.statValue}>
                    {entry.status === 'WAITING'
                      ? `${entry.estimatedWaitMinutes ?? '—'} min`
                      : '—'}
                  </strong>
                </div>
              </div>

              {['WAITING', 'CALLED'].includes(entry.status) && (
                <button
                  style={styles.cancelButton}
                  onClick={() => cancelEntry(entry._id)}
                >
                  Cancel Queue Entry
                </button>
              )}
            </div>
          ))
        )}

        <button
          style={styles.refreshButton}
          onClick={fetchQueue}
        >
          Refresh Queue
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f5f7fb',
    padding: '40px 20px',
    fontFamily: 'Arial, sans-serif',
    color: '#1f2937',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  backButton: {
    background: 'transparent',
    border: 'none',
    color: '#4f46e5',
    cursor: 'pointer',
    fontSize: '15px',
    marginBottom: '20px',
  },
  heading: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: '28px',
  },
  card: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '14px',
    boxShadow: '0 3px 15px rgba(0,0,0,0.06)',
    marginBottom: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  serviceName: {
    fontSize: '22px',
    margin: '0',
  },
  status: {
    padding: '7px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  waiting: {
    background: '#fef3c7',
    color: '#92400e',
  },
  called: {
    background: '#dbeafe',
    color: '#1d4ed8',
  },
  served: {
    background: '#d1fae5',
    color: '#065f46',
  },
  cancelled: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  tokenBox: {
    marginTop: '24px',
    padding: '20px',
    borderRadius: '10px',
    background: '#eef2ff',
    textAlign: 'center',
  },
  label: {
    display: 'block',
    color: '#6b7280',
    fontSize: '13px',
    marginBottom: '8px',
  },
  tokenNumber: {
    fontSize: '38px',
    color: '#4338ca',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginTop: '20px',
  },
  stat: {
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '10px',
  },
  statValue: {
    fontSize: '21px',
  },
  button: {
    padding: '12px 18px',
    border: 'none',
    borderRadius: '8px',
    background: '#4f46e5',
    color: '#ffffff',
    cursor: 'pointer',
  },
  cancelButton: {
    marginTop: '22px',
    padding: '12px 18px',
    border: 'none',
    borderRadius: '8px',
    background: '#dc2626',
    color: '#ffffff',
    cursor: 'pointer',
  },
  refreshButton: {
    padding: '12px 18px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#ffffff',
    cursor: 'pointer',
  },
  error: {
    color: '#b91c1c',
    background: '#fee2e2',
    padding: '12px',
    borderRadius: '8px',
  },
  success: {
    color: '#065f46',
    background: '#d1fae5',
    padding: '12px',
    borderRadius: '8px',
  },
};

export default MyQueue;
