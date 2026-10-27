
import { Routes, Route, Navigate } from 'react-router-dom';


import Home from './pages/home.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import Services from './pages/services.jsx';
import MyQueue from './pages/my-queue.jsx';
import Provider from './pages/provider.jsx';
import Admin from './pages/admin.jsx';

function App() {
  return (
    <Routes>
      {/* Homepage */}
      <Route path="/" element={<Home />} />

      {/* Login page */}
      <Route path="/login" element={<Login />} />

      {/* Registration page */}
      <Route path="/register" element={<Register />} />

      {/* Appointment booking pages */}
      <Route
        path="/services/:category"
        element={<Services />}
      />

      <Route path="/my-queue" element={<MyQueue />} />

      <Route path="/provider" element={<Provider />} />

      <Route path="/admin" element={<Admin />} />

      {/* Redirect unknown URLs to the homepage */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;
