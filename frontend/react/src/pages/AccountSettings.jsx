import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import ModernInput from "../components/ModernInput";
import ModernButton from "../components/ModernButton";
import ModernSelect from "../components/ModernSelect";
import { apiFetch } from "../api";
import { FaCog, FaBell, FaLock, FaTrash, FaCloudDownloadAlt, FaShieldAlt, FaUserShield, FaEye } from 'react-icons/fa';

export default function AccountSettings() {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        twoFactorAuth: false,
        sessionTimeout: 30,
        language: 'en',
        theme: 'light'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/settings`);
            const data = await response.json();
            setSettings(data.settings || settings);
        } catch (error) {
            console.error("Error fetching settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        setMessage("");

        try {
            await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/settings`, {
                method: 'PUT',
                body: JSON.stringify({ settings })
            });
            setMessage("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage("Failed to save settings. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        const formData = new FormData(e.target);
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (newPassword !== confirmPassword) {
            setMessage("New passwords do not match.");
            setSaving(false);
            return;
        }

        try {
            await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/change-password`, {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword })
            });
            setMessage("Password changed successfully!");
            e.target.reset();
        } catch (error) {
            console.error("Error changing password:", error);
            setMessage("Failed to change password. Please check your current password.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        setSaving(true);
        setMessage("");

        try {
            await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/delete-account`, {
                method: 'DELETE'
            });
            localStorage.clear();
            window.location.href = '/';
        } catch (error) {
            console.error("Error deleting account:", error);
            setMessage("Failed to delete account. Please try again.");
            setSaving(false);
        }
    };

    const handleExportData = async () => {
        try {
            const response = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/export-data`);
            const data = await response.json();
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'user-data.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error exporting data:", error);
            setMessage("Failed to export data. Please try again.");
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading settings...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="px-2 sm:px-4 md:px-6 py-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                            <p className="text-gray-600">Manage your account preferences and security settings</p>
                        </div>
                        <ModernButton 
                            onClick={() => window.location.href = '/profile'}
                            variant="secondary"
                            className="flex items-center"
                        >
                            <FaEye className="mr-2" />
                            Back to Profile
                        </ModernButton>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaBell className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Notifications</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {settings.emailNotifications ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaShieldAlt className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Security</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {settings.twoFactorAuth ? '2FA Enabled' : 'Standard'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <FaUserShield className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Session Timeout</p>
                                <p className="text-lg font-bold text-gray-900">{settings.sessionTimeout}m</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Settings Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Notification Settings Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FaBell className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                                        <p className="text-xs text-gray-500">Receive notifications via email</p>
                                    </div>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.emailNotifications}
                                            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:bg-blue-500 transition-all duration-200"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                                        <p className="text-xs text-gray-500">Receive push notifications</p>
                                    </div>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.pushNotifications}
                                            onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:bg-blue-500 transition-all duration-200"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <ModernButton
                                    onClick={handleSaveSettings}
                                    variant="primary"
                                    loading={saving}
                                    className="flex items-center"
                                >
                                    <FaCog className="mr-2" />
                                    Save Settings
                                </ModernButton>
                            </div>
                        </div>

                        {/* Change Password Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <FaLock className="w-5 h-5 text-orange-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                            </div>
                            <form onSubmit={handleChangePassword} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ModernInput
                                        name="currentPassword"
                                        label="Current Password"
                                        type="password"
                                        required
                                        placeholder="Enter current password"
                                    />
                                    <ModernInput
                                        name="newPassword"
                                        label="New Password"
                                        type="password"
                                        required
                                        placeholder="Enter new password"
                                    />
                                    <ModernInput
                                        name="confirmPassword"
                                        label="Confirm New Password"
                                        type="password"
                                        required
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <ModernButton
                                        type="submit"
                                        variant="primary"
                                        loading={saving}
                                        className="flex items-center"
                                    >
                                        <FaLock className="mr-2" />
                                        Change Password
                                    </ModernButton>
                                </div>
                            </form>
                            {message && (
                                <div className={`p-4 rounded-xl text-sm flex items-center gap-3 mt-4 ${
                                    message.includes("successfully") 
                                        ? "bg-green-50 text-green-700 border border-green-200" 
                                        : "bg-red-50 text-red-700 border border-red-200"
                                }`}>
                                    {message.includes("successfully") ? (
                                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    )}
                                    {message}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Security Overview Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-cyan-100 rounded-lg">
                                    <FaShieldAlt className="w-5 h-5 text-cyan-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Security Overview</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Two-Factor Auth</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        settings.twoFactorAuth 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {settings.twoFactorAuth ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Session Timeout</span>
                                    <span className="text-sm font-medium text-gray-900">{settings.sessionTimeout} minutes</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Theme</span>
                                    <span className="text-sm font-medium text-gray-900 capitalize">{settings.theme}</span>
                                </div>
                            </div>
                        </div>

                        {/* Data Management Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FaCloudDownloadAlt className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
                            </div>
                            <div className="space-y-3">
                                <ModernButton
                                    onClick={handleExportData}
                                    variant="secondary"
                                    className="w-full justify-start"
                                >
                                    <FaCloudDownloadAlt className="mr-2" />
                                    Export My Data
                                </ModernButton>
                                <ModernButton
                                    onClick={handleDeleteAccount}
                                    variant="secondary"
                                    className="w-full justify-start text-red-600 border-red-200 hover:text-red-700"
                                    loading={saving}
                                >
                                    <FaTrash className="mr-2" />
                                    Delete Account
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 