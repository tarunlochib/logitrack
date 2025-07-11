import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ModernContentCard from '../components/ModernContentCard';
import ModernInput from '../components/ModernInput';
import ModernButton from '../components/ModernButton';

const roles = ['SUPERADMIN', 'ADMIN', 'DISPATCHER', 'DRIVER'];

const AddUser = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'DISPATCHER',
    licenseNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formDisabled, setFormDisabled] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      // Only send licenseNumber if role is DRIVER
      const payload = { ...form };
      if (form.role !== 'DRIVER') delete payload.licenseNumber;
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/signup`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess('User created successfully! Redirecting...');
      setFormDisabled(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to create user. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <ModernContentCard className="w-full max-w-lg p-10">
        <ModernButton
          type="button"
          variant="secondary"
          size="sm"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          ← Back
        </ModernButton>
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Add New User</h2>
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded p-4 text-center text-lg font-semibold">{success}</div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5" disabled={formDisabled}>
          <ModernInput
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            required
            autoFocus
            disabled={formDisabled}
          />
          <ModernInput
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            disabled={formDisabled}
          />
          <ModernInput
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            disabled={formDisabled}
          />
          <ModernInput
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            disabled={formDisabled}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              required
              disabled={formDisabled}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          {form.role === 'DRIVER' && (
            <ModernInput
              type="text"
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
              placeholder="License Number"
              required
              disabled={formDisabled}
            />
          )}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm text-center">{error}</div>}
          <ModernButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full rounded-full text-lg font-semibold py-3 shadow-md bg-cyan-600 hover:bg-cyan-700 flex justify-center"
            disabled={loading || formDisabled}
          >
            {loading ? 'Creating...' : <span className="mx-auto">Create User</span>}
          </ModernButton>
        </form>
        )}
      </ModernContentCard>
    </div>
  );
};

export default AddUser; 