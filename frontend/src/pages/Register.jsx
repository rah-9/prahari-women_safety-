import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'user', gender: 'prefer_not_to_say' });
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-10 bg-background">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <UserPlus className="text-secondary mb-2" size={40} />
          <h2 className="text-2xl font-bold text-textMain">Create Account</h2>
          <p className="text-sm text-gray-500 mt-1">Join the Prahari safe network</p>
        </div>

        {error && <div className="mb-4 text-sm text-danger bg-red-50 p-3 rounded-xl">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I want to be a</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none"
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">User (Need Safety)</option>
              <option value="helper">Verified Helper (Volunteer)</option>
            </select>
          </div>
          
          <button 
            type="submit"
            className="w-full py-3 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 transition-colors shadow-sm mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
