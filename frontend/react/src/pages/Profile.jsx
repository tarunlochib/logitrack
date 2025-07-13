import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import ModernInput from "../components/ModernInput";
import ModernButton from "../components/ModernButton";
import { apiFetch } from "../api";
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaUserShield, FaCalendarAlt, FaCog, FaEdit } from 'react-icons/fa';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        setUser(userData);
        setLoading(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const response = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: user.name,
                    phone: user.phone
                })
            });

            const updatedUser = await response.json();
            localStorage.setItem("user", JSON.stringify(updatedUser.user));
            setUser(updatedUser.user);
            setMessage("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading profile...</p>
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
                            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                            <p className="text-gray-600">Manage your personal information and account details</p>
                        </div>
                        <ModernButton 
                            onClick={() => window.location.reload()}
                            variant="secondary"
                            className="flex items-center"
                        >
                            <FaEdit className="mr-2" />
                            Refresh
                        </ModernButton>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaUser className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Account Type</p>
                                <p className="text-lg font-bold text-gray-900 capitalize">{user?.role || 'User'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaEnvelope className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Email Status</p>
                                <p className="text-lg font-bold text-gray-900">Verified</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <FaCalendarAlt className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Member Since</p>
                                <p className="text-lg font-bold text-gray-900">Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Profile Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FaIdCard className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ModernInput
                                        name="name"
                                        label="Full Name"
                                        value={user?.name || ""}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                    <ModernInput
                                        name="phone"
                                        label="Phone Number"
                                        value={user?.phone || ""}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                
                                {/* Feedback Message */}
                                {message && (
                                    <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
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
                                
                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <ModernButton
                                        type="submit"
                                        variant="primary"
                                        loading={saving}
                                        className="flex items-center"
                                    >
                                        <FaEdit className="mr-2" />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </ModernButton>
                                </div>
                            </form>
                        </div>

                        {/* Account Details Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FaEnvelope className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Account Details</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <FaEnvelope className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900 font-medium">{user?.email || "Not available"}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Role</label>
                                        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <FaUserShield className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-900 font-medium capitalize">{user?.role || "User"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Profile Avatar Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                    <FaUser className="w-10 h-10 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{user?.name || "User"}</h3>
                                <p className="text-sm text-gray-500 capitalize">{user?.role || "User"}</p>
                                <div className="mt-4 w-full">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Status</span>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-cyan-100 rounded-lg">
                                    <FaCog className="w-5 h-5 text-cyan-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="space-y-3">
                                <ModernButton
                                    onClick={() => window.location.href = '/account-settings'}
                                    variant="secondary"
                                    className="w-full justify-start"
                                >
                                    <FaCog className="mr-2" />
                                    Account Settings
                                </ModernButton>
                                <ModernButton
                                    onClick={() => window.location.href = '/dashboard'}
                                    variant="secondary"
                                    className="w-full justify-start"
                                >
                                    <FaUser className="mr-2" />
                                    Back to Dashboard
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 