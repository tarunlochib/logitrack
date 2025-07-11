import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ModernContentCard from "../components/ModernContentCard";
import ModernButton from "../components/ModernButton";
import ModernInput from "../components/ModernInput";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [formData, setFormData] = useState({ name: "", phone: "" });

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData) {
            navigate("/login");
            return;
        }
        setUser(userData);
        setFormData({
            name: userData.name || "",
            phone: userData.phone || ""
        });
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/profile`,
                { name: formData.name, phone: formData.phone },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: user?.name || "",
            phone: user?.phone || ""
        });
        setIsEditing(false);
    };

    if (!user) return null;

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
            <ModernContentCard>
                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center text-white text-4xl font-bold mb-4">
                        {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <div className="text-xl font-semibold text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{user.role?.toLowerCase()}</div>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        {isEditing ? (
                            <ModernInput
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter your full name"
                                disabled={isLoading}
                            />
                        ) : (
                            <div className="text-gray-900 font-medium">{user.name || "Not provided"}</div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="text-gray-900 font-medium">{user.email}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        {isEditing ? (
                            <ModernInput
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter your phone number"
                                disabled={isLoading}
                            />
                        ) : (
                            <div className="text-gray-900 font-medium">{user.phone || "Not provided"}</div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <div className="text-gray-900 font-medium capitalize">{user.role?.toLowerCase()}</div>
                    </div>
                </div>
                <div className="flex space-x-3 mt-8 justify-end">
                    {isEditing ? (
                        <>
                            <ModernButton
                                onClick={handleSave}
                                variant="primary"
                                size="md"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </ModernButton>
                            <ModernButton
                                onClick={handleCancel}
                                variant="secondary"
                                size="md"
                                disabled={isLoading}
                            >
                                Cancel
                            </ModernButton>
                        </>
                    ) : (
                        <ModernButton
                            onClick={() => setIsEditing(true)}
                            variant="primary"
                            size="md"
                        >
                            Edit Profile
                        </ModernButton>
                    )}
                </div>
                {message.text && (
                    <div className={`p-4 rounded-lg mt-6 ${
                        message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                        message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                        'bg-blue-50 border border-blue-200 text-blue-800'
                    }`}>
                        {message.text}
                    </div>
                )}
            </ModernContentCard>
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