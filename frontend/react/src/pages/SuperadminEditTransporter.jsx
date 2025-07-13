import React, { useEffect, useState } from 'react';
import ModernButton from '../components/ModernButton';
import ModernInput from '../components/ModernInput';
import ModernSelect from '../components/ModernSelect';
import { api } from '../api';
import { useNavigate, useParams } from 'react-router-dom';

export default function SuperadminEditTransporter() {
  const { id } = useParams();
  const isEdit = !!id;
  const [form, setForm] = useState({ name: '', domain: '', isActive: true, gstNumber: '', adminName: '', adminEmail: '', adminPassword: '' });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) fetchTransporter();
    // eslint-disable-next-line
  }, [id]);

  const fetchTransporter = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/superadmin/transporters/${id}`);
      setForm({
        name: res.data?.name || res.name || '',
        domain: res.data?.domain || res.domain || '',
        isActive: res.data?.isActive ?? res.isActive ?? true,
        gstNumber: res.data?.gstNumber || res.gstNumber || '',
        adminName: '',
        adminEmail: '',
        adminPassword: ''
      });
    } catch {
      setError('Failed to load transporter');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      if (isEdit) {
        await api.patch(`/superadmin/transporters/${id}`, form);
        navigate(`/superadmin/transporters/${id}`);
      } else {
        // Validate required fields
        if (!form.name || !form.adminName || !form.adminEmail || !form.adminPassword) {
          setError('Please fill all required fields.');
          return;
        }
        const res = await api.post('/superadmin/transporters', {
          transporterName: form.name,
          adminName: form.adminName,
          adminEmail: form.adminEmail,
          adminPassword: form.adminPassword,
          gstNumber: form.gstNumber,
          domain: form.domain,
        });
        navigate(`/superadmin/transporters/${res.data?.transporter?.id || res.transporter?.id}`);
      }
    } catch {
      setError('Failed to save transporter');
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit' : 'Add'} Transporter</h1>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ModernInput
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <ModernInput
            label="GST Number"
            name="gstNumber"
            value={form.gstNumber}
            onChange={handleChange}
          />
          <ModernInput
            label="Domain"
            name="domain"
            value={form.domain}
            onChange={handleChange}
          />
          {!isEdit && (
            <>
              <ModernInput
                label="Admin Name"
                name="adminName"
                value={form.adminName}
                onChange={handleChange}
                required
              />
              <ModernInput
                label="Admin Email"
                name="adminEmail"
                type="email"
                value={form.adminEmail}
                onChange={handleChange}
                required
              />
              <div>
                <label className="block text-sm font-medium mb-1">Admin Password <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="adminPassword"
                    value={form.adminPassword}
                    onChange={handleChange}
                    className="border rounded px-3 py-2 w-full"
                    required
                  />
                  <button type="button" className="text-xs text-gray-500" onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </>
          )}
          <ModernSelect
            label="Status"
            name="isActive"
            value={form.isActive ? 'active' : 'inactive'}
            onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'active' }))}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
          <div className="flex gap-4 mt-4">
            <ModernButton type="submit" variant="primary">{isEdit ? 'Save' : 'Create'}</ModernButton>
            <ModernButton type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</ModernButton>
          </div>
        </form>
      )}
    </div>
  );
} 