import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Users, ShieldCheck, UserCheck, BarChart3, Activity, AlertTriangle, CheckCircle, XCircle, Clock, Database } from 'lucide-react';
import { API_URL } from '../services/config';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-textMain">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [helpers, setHelpers] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [adding, setAdding] = useState(false);

  const fetchHelpers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/helpers`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setHelpers(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAnalytics(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleVerifyHelper = async (id) => {
    try {
      await fetch(`${API_URL}/admin/helpers/${id}/verify`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      fetchHelpers();
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user from the system?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        fetchUsers();
        fetchHelpers();
        fetchAnalytics(); // Refresh graphs
      }
    } catch (err) { console.error(err); }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAdding(true);
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData);
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        e.target.reset();
        fetchUsers();
        fetchHelpers();
        fetchAnalytics();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to add user');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
    setAdding(false);
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await fetch(`${API_URL}/admin/seed`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      await fetchAnalytics();
    } catch (err) { console.error(err); }
    setSeeding(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAnalytics(), fetchHelpers(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, [token]);

  const s = analytics?.stats || {};

  const pieData = [
    { name: 'Resolved', value: s.resolvedSOS || 0 },
    { name: 'Assigned', value: s.assignedSOS || 0 },
    { name: 'Cancelled', value: s.cancelledSOS || 0 },
    { name: 'Active', value: s.activeSOS || 0 },
    { name: 'Expired', value: s.expiredSOS || 0 },
  ].filter(d => d.value > 0);

  const barData = (analytics?.sosPerDay || []).map(d => ({ date: d._id.substring(5), count: d.count }));

  const statusBadge = (status) => {
    const map = {
      resolved: 'bg-green-100 text-green-700',
      helper_assigned: 'bg-blue-100 text-blue-700',
      active: 'bg-orange-100 text-orange-700',
      cancelled: 'bg-red-100 text-red-700',
      expired: 'bg-gray-100 text-gray-600',
    };
    return map[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-gray-400 text-lg">Loading Admin Panel...</p></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Header */}
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm mb-6 border border-gray-100">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-secondary" size={32} />
          <div>
            <h1 className="text-xl font-bold text-textMain">Admin Control Center</h1>
            <p className="text-sm text-gray-500">Prahari Network Management</p>
          </div>
        </div>
        <button onClick={logout} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
          <LogOut size={24} />
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'helpers', label: 'Manage Helpers', icon: UserCheck },
          { id: 'users', label: 'View Users', icon: Users },
        ].map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 font-semibold rounded-2xl transition-all shadow-sm text-sm
              ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
        <button onClick={handleSeedData} disabled={seeding}
          className="flex items-center gap-2 px-5 py-3 font-semibold rounded-2xl transition-all shadow-sm text-sm bg-white text-gray-600 hover:bg-gray-50 ml-auto">
          <Database size={18} /> {seeding ? 'Seeding...' : 'Seed Demo Data'}
        </button>
      </div>

      {/* ========== OVERVIEW TAB ========== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon={Users} label="Total Users" value={s.totalUsers || 0} color="bg-indigo-500" />
            <StatCard icon={UserCheck} label="Total Helpers" value={s.totalHelpers || 0} color="bg-blue-500" />
            <StatCard icon={CheckCircle} label="Verified Helpers" value={s.verifiedHelpers || 0} color="bg-emerald-500" />
            <StatCard icon={Activity} label="Online Helpers" value={s.onlineHelpers || 0} color="bg-green-500" />
            <StatCard icon={AlertTriangle} label="Total SOS" value={s.totalSOS || 0} color="bg-red-500" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-textMain mb-4">SOS Status Distribution</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-400 py-10">No SOS data yet. Click "Seed Demo Data" above.</p>
              )}
            </div>

            {/* Bar Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-textMain mb-4">SOS Alerts (Last 7 Days)</h3>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} name="SOS Calls" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-400 py-10">No recent SOS data. Click "Seed Demo Data" above.</p>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-emerald-600">{s.resolvedSOS || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Rescued</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-blue-600">{s.assignedSOS || 0}</p>
              <p className="text-sm text-gray-500 mt-1">In Progress</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-red-500">{s.cancelledSOS || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Cancelled</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold text-orange-500">{s.activeSOS || 0}</p>
              <p className="text-sm text-gray-500 mt-1">Active Now</p>
            </div>
          </div>

          {/* Recent SOS Logs */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2"><Clock size={20} /> Recent SOS Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase">User</th>
                    <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Status</th>
                    <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Location</th>
                    <th className="py-3 px-4 font-semibold text-gray-500 text-xs uppercase">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.recentSOS || []).map(sos => (
                    <tr key={sos._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-textMain">{sos.userId?.name || 'Unknown'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusBadge(sos.status)}`}>
                          {sos.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{sos.location?.coordinates ? `${sos.location.coordinates[1].toFixed(4)}, ${sos.location.coordinates[0].toFixed(4)}` : 'N/A'}</td>
                      <td className="py-3 px-4 text-gray-500 text-sm">{new Date(sos.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!analytics?.recentSOS || analytics.recentSOS.length === 0) && (
                    <tr><td colSpan="4" className="text-center py-6 text-gray-400">No SOS records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========== HELPERS TAB ========== */}
      {activeTab === 'helpers' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-4 px-4 font-semibold text-gray-600">Name</th>
                  <th className="py-4 px-4 font-semibold text-gray-600">Email</th>
                  <th className="py-4 px-4 font-semibold text-gray-600">Contact</th>
                  <th className="py-4 px-4 font-semibold text-gray-600">Gender</th>
                  <th className="py-4 px-4 font-semibold text-gray-600">Online</th>
                  <th className="py-4 px-4 font-semibold text-gray-600">Status</th>
                  <th className="py-4 px-4 font-semibold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {helpers.map(helper => (
                  <tr key={helper._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-textMain">{helper.userId?.name || 'Unknown'}</td>
                    <td className="py-4 px-4 text-gray-600">{helper.userId?.email || '-'}</td>
                    <td className="py-4 px-4 text-gray-600">{helper.userId?.phone || '-'}</td>
                    <td className="py-4 px-4 text-gray-600 capitalize">{helper.userId?.gender?.replace(/_/g, ' ') || 'N/A'}</td>
                    <td className="py-4 px-4">{helper.isOnline ? <span className="text-green-600 font-bold">● Online</span> : <span className="text-gray-400">Offline</span>}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${helper.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {helper.verificationStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {helper.verificationStatus !== 'verified' && (
                        <button onClick={() => handleVerifyHelper(helper._id)}
                          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow hover:bg-primary/90 transition-colors">
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {helpers.length === 0 && <tr><td colSpan="7" className="text-center py-6 text-gray-400">No helpers registered.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== USERS TAB ========== */}
      {activeTab === 'users' && (
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-[3] bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
            <h3 className="text-lg font-bold text-textMain mb-4">Network Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-4 font-semibold text-gray-600">Name</th>
                    <th className="py-4 px-4 font-semibold text-gray-600">Email</th>
                    <th className="py-4 px-4 font-semibold text-gray-600">Gender</th>
                    <th className="py-4 px-4 font-semibold text-gray-600">Role</th>
                    <th className="py-4 px-4 font-semibold text-gray-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-medium text-textMain">{u.name}</td>
                      <td className="py-4 px-4 text-gray-600">{u.email}</td>
                      <td className="py-4 px-4 text-gray-600 capitalize">{u.gender?.replace(/_/g, ' ') || 'N/A'}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'helper' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {u.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-danger hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                            title="Remove User"
                          >
                            <XCircle size={20} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan="5" className="text-center py-6 text-gray-400">No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
            <h3 className="text-lg font-bold text-textMain mb-4">Add New Identity</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                  <input required name="name" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                  <input required type="email" name="email" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number</label>
                  <input required name="phone" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none" />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                  <select name="gender" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="prefer_not_to_say">Prefer not to say</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                  <select name="role" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                    <option value="helper">Verified Helper</option>
                    <option value="user">Requester/User</option>
                    <option value="admin">Administrator</option>
                  </select>
               </div>
               <button 
                 type="submit" disabled={adding}
                 className="w-full py-3 mt-4 bg-primary text-white rounded-xl font-bold shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
               >
                 {adding ? 'Creating...' : 'Create Account'}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
