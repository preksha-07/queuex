
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [averageServiceTime, setAverageServiceTime] = useState(10);

  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('queuexToken');
  const user = JSON.parse(localStorage.getItem('queuexUser') || '{}');

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      setError('Access denied. Only administrators can access this page.');
      setLoading(false);
      return;
    }

    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const [usersResponse, servicesResponse] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users', {
          headers,
        }),
        fetch('http://localhost:5000/api/services'),
      ]);

      const usersData = await usersResponse.json();
      const servicesData = await servicesResponse.json();

      if (!usersResponse.ok) {
        throw new Error(
          usersData.message || 'Could not load registered users.'
        );
      }

      if (!servicesResponse.ok) {
        throw new Error(
          servicesData.message || 'Could not load services.'
        );
      }

      setUsers(Array.isArray(usersData) ? usersData : usersData.users || []);
      setServices(
        Array.isArray(servicesData)
          ? servicesData
          : servicesData.services || []
      );
    } catch (err) {
      setError(err.message || 'Could not load the admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setAverageServiceTime(10);
    setEditingId(null);
  };

  const saveService = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const serviceTime = Number(averageServiceTime);

    if (!name.trim() || !Number.isFinite(serviceTime) || serviceTime < 1) {
      setError('Enter a service name and a service time of at least 1 minute.');
      return;
    }

    const editing = Boolean(editingId);
    const url = editing
      ? `http://localhost:5000/api/services/${editingId}`
      : 'http://localhost:5000/api/services';

    try {
      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          averageServiceTime: serviceTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not save the service.');
      }

      setMessage(editing ? 'Service updated successfully!' : 'Service added successfully!');
      resetForm();
      await loadDashboard();
    } catch (err) {
      setError(err.message || 'Could not save the service.');
    }
  };

  const startEditing = (service) => {
    setEditingId(service._id);
    setName(service.name || '');
    setDescription(service.description || '');
    setAverageServiceTime(service.averageServiceTime || 10);
    setMessage('');
    setError('');

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <main style={styles.page}>Loading admin dashboard...</main>;
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => navigate('/')}>
          ← Home
        </button>

        <h1 style={styles.heading}>Admin Dashboard</h1>
        <p style={styles.subtitle}>
          Manage QUEUEX services and view registered users.
        </p>

        {error && <p style={styles.error}>{error}</p>}
        {message && <p style={styles.success}>{message}</p>}

        {user.role === 'ADMIN' && (
          <>
            <div style={styles.stats}>
              <div style={styles.statCard}>
                <span>Registered Users</span>
                <strong>{users.length}</strong>
              </div>
              <div style={styles.statCard}>
                <span>Active Services</span>
                <strong>{services.length}</strong>
              </div>
            </div>

            <section style={styles.card}>
              <h2>{editingId ? 'Edit Service' : 'Add New Service'}</h2>

              <form onSubmit={saveService}>
                <label style={styles.label} htmlFor="service-name">
                  Service Name
                </label>
                <input
                  id="service-name"
                  style={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Doctor Consultation"
                  required
                />

                <label style={styles.label} htmlFor="service-description">
                  Description
                </label>
                <textarea
                  id="service-description"
                  style={styles.input}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this service"
                  rows={3}
                />

                <label style={styles.label} htmlFor="service-time">
                  Average Service Time (minutes)
                </label>
                <input
                  id="service-time"
                  style={styles.input}
                  type="number"
                  min="1"
                  value={averageServiceTime}
                  onChange={(e) => setAverageServiceTime(e.target.value)}
                  required
                />

                <div style={styles.actions}>
                  <button style={styles.primaryButton} type="submit">
                    {editingId ? 'Save Changes' : 'Add Service'}
                  </button>

                  {editingId && (
                    <button
                      style={styles.secondaryButton}
                      type="button"
                      onClick={resetForm}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section style={styles.card}>
              <div style={styles.sectionHeader}>
                <h2>Services</h2>
                <button style={styles.secondaryButton} onClick={loadDashboard}>
                  Refresh
                </button>
              </div>

              {services.length === 0 ? (
                <p>No active services found.</p>
              ) : (
                services.map((service) => (
                  <div key={service._id} style={styles.listItem}>
                    <div>
                      <strong>{service.name}</strong>
                      <p style={styles.muted}>
                        {service.description || 'No description'}
                      </p>
                      <small>
                        Average time: {service.averageServiceTime} minutes
                      </small>
                    </div>

                    <button
                      style={styles.secondaryButton}
                      onClick={() => startEditing(service)}
                    >
                      Edit
                    </button>
                  </div>
                ))
              )}
            </section>

            <section style={styles.card}>
              <h2>Registered Users</h2>

              {users.length === 0 ? (
                <p>No registered users found.</p>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.cell}>Name</th>
                        <th style={styles.cell}>Email</th>
                        <th style={styles.cell}>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item) => (
                        <tr key={item._id}>
                          <td style={styles.cell}>{item.name}</td>
                          <td style={styles.cell}>{item.email}</td>
                          <td style={styles.cell}>{item.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

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
  heading: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: '25px',
  },
  backButton: {
    border: 0,
    background: '#4f46e5',
    color: '#fff',
    padding: '12px 18px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '18px',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  statCard: {
    background: '#fff',
    padding: '22px',
    borderRadius: '12px',
    boxShadow: '0 3px 15px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  card: {
    background: '#fff',
    padding: '24px',
    borderRadius: '14px',
    boxShadow: '0 3px 15px rgba(0,0,0,0.05)',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginTop: '16px',
    marginBottom: '7px',
  },
  input: {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    font: 'inherit',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '18px',
  },
  primaryButton: {
    background: '#4f46e5',
    color: '#fff',
    border: 0,
    borderRadius: '8px',
    padding: '12px 18px',
    cursor: 'pointer',
  },
  secondaryButton: {
    background: '#374151',
    color: '#fff',
    border: 0,
    borderRadius: '8px',
    padding: '10px 15px',
    cursor: 'pointer',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    padding: '16px 0',
    borderBottom: '1px solid #e5e7eb',
  },
  muted: {
    color: '#6b7280',
    margin: '6px 0',
  },
  tableWrap: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  cell: {
    padding: '12px 10px',
    borderBottom: '1px solid #e5e7eb',
    overflowWrap: 'anywhere',
  },
  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '12px',
    borderRadius: '8px',
  },
  success: {
    background: '#d1fae5',
    color: '#065f46',
    padding: '12px',
    borderRadius: '8px',
  },
};

export default Admin;
