import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import HelperDashboard from './pages/HelperDashboard';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background text-textMain">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute requiredRole="user">
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/helper-dashboard" element={
            <PrivateRoute requiredRole="helper">
              <HelperDashboard />
            </PrivateRoute>
          } />

          <Route path="/admin-dashboard" element={
            <PrivateRoute requiredRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
