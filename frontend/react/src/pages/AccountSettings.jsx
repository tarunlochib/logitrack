import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ModernContentCard from "../components/ModernContentCard";
import ModernButton from "../components/ModernButton";
import ModernInput from "../components/ModernInput";

export default function AccountSettings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        twoFactorAuth: false,
        sessionTimeout: 30,
        language: 'en',
        theme: 'light'
    });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData) {
            navigate("/login");
            return;
        }
        setUser(userData);
        loadUserSettings();
    }, [navigate]);

    const loadUserSettings = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.settings) {
                setSettings(response.data.settings);
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        }
    };

    const saveSettings = async (newSettings) => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/settings`, 
                { settings: newSettings },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSettings(newSettings);
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleSettingChange = async (setting, value) => {
        const newSettings = {
            ...settings,
            [setting]: value
        };
        setSettings(newSettings);
        await saveSettings(newSettings);
    };

    const handlePasswordUpdate = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords don\'t match!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return;
        }
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/change-password`, 
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setIsChangingPassword(false);
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Error updating password:", error);
            const errorMessage = error.response?.data?.message || 'Failed to update password. Please check your current password.';
            setMessage({ type: 'error', text: errorMessage });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("token");
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/delete-account`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/");
            } catch (error) {
                console.error("Error deleting account:", error);
                setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleExportData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/export-data`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `user-data-${user.name}-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setMessage({ type: 'success', text: 'Data exported successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Error exporting data:", error);
            setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
            <ModernContentCard>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Security</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                        {!isChangingPassword ? (
                            <ModernButton
                                onClick={() => setIsChangingPassword(true)}
                                variant="primary"
                                size="sm"
                                disabled={isLoading}
                            >
                                Change Password
                            </ModernButton>
                        ) : (
                            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <ModernInput
                                    name="currentPassword"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Current password"
                                    disabled={isLoading}
                                />
                                <ModernInput
                                    name="newPassword"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="New password (min 6 characters)"
                                    disabled={isLoading}
                                />
                                <ModernInput
                                    name="confirmPassword"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Confirm new password"
                                    disabled={isLoading}
                                />
                                <div className="flex space-x-3">
                                    <ModernButton
                                        onClick={handlePasswordUpdate}
                                        variant="primary"
                                        size="sm"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Updating...' : 'Update Password'}
                                    </ModernButton>
                                    <ModernButton
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordData({
                                                currentPassword: "",
                                                newPassword: "",
                                                confirmPassword: ""
                                            });
                                        }}
                                        variant="secondary"
                                        size="sm"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </ModernButton>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <button
                            onClick={() => handleSettingChange('twoFactorAuth', !settings.twoFactorAuth)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.twoFactorAuth ? 'bg-cyan-600' : 'bg-gray-300'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>
                </div>
            </ModernContentCard>
            <ModernContentCard>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Email Notifications</h3>
                            <p className="text-sm text-gray-600">Receive updates via email</p>
                        </div>
                        <button
                            onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.emailNotifications ? 'bg-cyan-600' : 'bg-gray-300'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
                            <p className="text-sm text-gray-600">Receive real-time notifications</p>
                        </div>
                        <button
                            onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
                            disabled={isLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.pushNotifications ? 'bg-cyan-600' : 'bg-gray-300'
                            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>
                </div>
            </ModernContentCard>
            <ModernContentCard>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                            value={settings.language}
                            onChange={(e) => handleSettingChange('language', e.target.value)}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
                        >
                            <option value="en">English</option>
                            <option value="es">Español</option>
                            <option value="fr">Français</option>
                            <option value="de">Deutsch</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <select
                            value={settings.theme}
                            onChange={(e) => handleSettingChange('theme', e.target.value)}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                        <select
                            value={settings.sessionTimeout}
                            onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                        </select>
                    </div>
                </div>
            </ModernContentCard>
            <ModernContentCard>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Management</h2>
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Your Data</h3>
                        <p className="text-sm text-gray-600 mb-4">Download all your data in JSON format</p>
                        <ModernButton
                            onClick={handleExportData}
                            variant="primary"
                            size="sm"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Exporting...' : 'Export Data'}
                        </ModernButton>
                    </div>
                </div>
            </ModernContentCard>
            <ModernContentCard>
                <h2 className="text-2xl font-bold text-red-600 mb-6">Danger Zone</h2>
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Delete Account</h3>
                        <p className="text-sm text-red-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                        <ModernButton
                            onClick={handleDeleteAccount}
                            variant="danger"
                            size="sm"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Deleting...' : 'Delete Account'}
                        </ModernButton>
                    </div>
                </div>
            </ModernContentCard>
            {message.text && (
                <div className={`p-4 rounded-lg ${
                    message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                    message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                    'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                    {message.text}
                </div>
            )}
            <div className="flex justify-end mt-6">
                <ModernButton
                    onClick={() => navigate(-1)}
                    variant="secondary"
                    size="md"
                >
                    ← Back
                </ModernButton>
            </div>
        </div>
    );
} 