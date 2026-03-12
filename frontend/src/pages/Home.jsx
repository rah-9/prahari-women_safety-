import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin-dashboard" />;
    return <Navigate to={user.role === 'helper' ? "/helper-dashboard" : "/dashboard"} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm p-8 text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full text-primary">
            <ShieldAlert size={48} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-textMain mb-4">Prahari</h1>
        <p className="text-gray-500 mb-8 font-medium">
          Real-time emergency response system connecting you with verified nearby helpers.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link 
            to="/login"
            className="w-full bg-primary text-white py-3 px-4 rounded-2xl font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Log In
          </Link>
          <Link 
            to="/register"
            className="w-full bg-pink-50 text-secondary py-3 px-4 rounded-2xl font-semibold hover:bg-pink-100 transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
