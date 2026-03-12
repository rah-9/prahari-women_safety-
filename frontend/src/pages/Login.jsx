import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-background">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <Shield className="text-primary mb-2" size={40} />
          <h2 className="text-2xl font-bold text-textMain">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue to Prahari</p>
        </div>

        {error && <div className="mb-4 text-sm text-danger bg-red-50 p-3 rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 transition-colors shadow-sm mt-2"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
