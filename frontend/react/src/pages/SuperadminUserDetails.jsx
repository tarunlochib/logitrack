import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModernContentCard from '../components/ModernContentCard';
import ModernButton from '../components/ModernButton';
import ModernInput from '../components/ModernInput';
import ModernSelect from '../components/ModernSelect';
import { api } from '../api';

const roleOptions = [
  { value: 'SUPERADMIN', label: 'Superadmin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'DISPATCHER', label: 'Dispatcher' },
  { value: 'DRIVER', label: 'Driver' },
];

export default function SuperadminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/users/${id}`);
      const found = res.data || res;
      setUser(found);
      setForm({
        name: found?.name || '',
        email: found?.email || '',
        role: found?.role || '',
        phone: found?.phone || ''
      });
    } catch (err) {
      setError('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    setStatusLoading(true);
    setError('');
    try {
      await api.patch(`/users/${user.id}/status`, { isActive: !user.isActive });
      fetchUser();
    } catch (err) {
      setError('Failed to update user status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancelEdit = () => {
    setEditMode(false);
    setForm({ name: user.name, email: user.email, role: user.role, phone: user.phone });
  };
  const handleFormChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setError('');
    try {
      await api.patch(`/users/${user.id}`, form);
      setEditMode(false);
      fetchUser();
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleResetPassword = async () => {
    setResetLoading(true);
    setResetPassword('');
    setError('');
    try {
      const res = await api.post(`/users/${user.id}/reset-password`);
      setResetPassword(res.data?.newPassword || res.newPassword || '');
    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center text-red-600">User not found.</div>;

  return (
    <div>
      <ModernContentCard>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">User Details</h2>
          <ModernButton onClick={() => navigate(-1)} variant="secondary">Back</ModernButton>
        </div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="mb-6">
          <div className="mb-2"><b>Name:</b> {editMode ? <ModernInput name="name" value={form.name} onChange={handleFormChange} /> : user.name}</div>
          <div className="mb-2"><b>Email:</b> {editMode ? <ModernInput name="email" value={form.email} onChange={handleFormChange} /> : user.email}</div>
          <div className="mb-2"><b>Role:</b> {editMode ? <ModernSelect name="role" value={form.role} onChange={handleFormChange} options={roleOptions} /> : user.role}</div>
          <div className="mb-2"><b>Phone:</b> {editMode ? <ModernInput name="phone" value={form.phone} onChange={handleFormChange} /> : (user.phone || '—')}</div>
          <div className="mb-2"><b>Transporter:</b> {user.tenant?.name || '—'}</div>
          <div className="mb-2"><b>Status:</b> <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></div>
        </div>
        {editMode ? (
          <div className="flex gap-2">
            <ModernButton onClick={handleSave}>Save</ModernButton>
            <ModernButton onClick={handleCancelEdit} variant="secondary">Cancel</ModernButton>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <ModernButton onClick={handleEdit}>Edit</ModernButton>
            <ModernButton onClick={handleStatusToggle} variant={user.isActive ? 'danger' : 'primary'} disabled={statusLoading}>
              {user.isActive ? 'Deactivate' : 'Activate'}
            </ModernButton>
            <ModernButton onClick={handleResetPassword} variant="secondary" disabled={resetLoading}>
              Reset Password
            </ModernButton>
          </div>
        )}
        {resetPassword && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800">
            New password: <b>{resetPassword}</b>
          </div>
        )}
      </ModernContentCard>
    </div>
  );
} 