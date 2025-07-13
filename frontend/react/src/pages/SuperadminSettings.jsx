import React, { useState, useEffect } from 'react';
import ModernInput from '../components/ModernInput';
import ModernSelect from '../components/ModernSelect';
import ModernButton from '../components/ModernButton';
import { apiFetch } from '../api';

const defaultSettings = {
  platformName: '',
  supportEmail: '',
  defaultLanguage: 'en',
  theme: 'system',
  enableRegistration: true,
  maintenanceMode: false,
};

export default function SuperadminSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      setFetching(true);
      setError('');
      try {
        const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/superadmin/settings`);
        if (!res || !res.ok) throw new Error('Failed to fetch settings');
        const data = await res.json();
        setSettings({ ...defaultSettings, ...data });
      } catch (err) {
        setError('Failed to load settings.');
      } finally {
        setFetching(false);
      }
    }
    fetchSettings();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/superadmin/settings`, {
        method: 'PUT',
        body: JSON.stringify({ data: settings })
      });
      if (!res || !res.ok) throw new Error('Failed to update settings');
      setSuccess('Settings updated successfully!');
    } catch (err) {
      setError('Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <h1 className="text-3xl font-bold mb-6">System Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
          <ModernInput
            name="platformName"
            value={settings.platformName}
            onChange={handleChange}
            placeholder="Enter platform name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
          <ModernInput
            name="supportEmail"
            type="email"
            value={settings.supportEmail}
            onChange={handleChange}
            placeholder="support@example.com"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Language</label>
            <ModernSelect
              name="defaultLanguage"
              value={settings.defaultLanguage}
              onChange={handleChange}
              options={[
                { value: 'en', label: 'English' },
                { value: 'hi', label: 'Hindi' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <ModernSelect
              name="theme"
              value={settings.theme}
              onChange={handleChange}
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ]}
            />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="enableRegistration"
              checked={settings.enableRegistration}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-cyan-600"
            />
            <span className="text-gray-700">Enable New User Registration</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-cyan-600"
            />
            <span className="text-gray-700">Maintenance Mode</span>
          </label>
        </div>
        {success && <div className="bg-green-50 border border-green-200 text-green-700 rounded p-2 text-sm">{success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">{error}</div>}
        <div className="flex justify-end">
          <ModernButton
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </ModernButton>
        </div>
      </form>
    </div>
  );
} 