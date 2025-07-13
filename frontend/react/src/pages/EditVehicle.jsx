import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import Layout from "../components/Layout";
import ModernInput from "../components/ModernInput";
import ModernButton from "../components/ModernButton";
import toast from 'react-hot-toast';

export default function EditVehicle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        number: "",
        model: "",
        capacity: "",
        isAvailable: true,
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles/${id}`);
                const vehicle = await res.json();
                setFormData({
                    number: vehicle.number,
                    model: vehicle.model,
                    capacity: vehicle.capacity.toString(),
                    isAvailable: vehicle.isAvailable,
                });
            } catch (error) {
                console.error("❌ Error fetching vehicle:", error);
                setError("Failed to load vehicle details. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchVehicle();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const validateForm = () => {
        if (!formData.number.trim()) {
            toast.error("Please enter the vehicle number.");
            return false;
        }
        if (!formData.model.trim()) {
            toast.error("Please enter the vehicle model.");
            return false;
        }
        if (!formData.capacity || Number(formData.capacity) <= 0) {
            toast.error("Please enter a valid capacity (greater than 0).");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        const payload = {
            number: formData.number.trim(),
            model: formData.model.trim(),
            capacity: Number(formData.capacity),
            isAvailable: formData.isAvailable,
        };

        try {
            await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            toast.success("Vehicle updated successfully");
            navigate(`/vehicles/${id}`);
        } catch (error) {
            toast.error("Failed to update vehicle. Please try again.");
            console.error("Error updating vehicle:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="p-6">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading vehicle details...</span>
                </div>
            </div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div className="p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                    <button 
                        onClick={() => navigate("/vehicles")}
                        className="ml-4 text-red-600 hover:text-red-800 underline"
                    >
                        Back to Vehicles
                    </button>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-2xl shadow border border-gray-100 px-6 py-6 mb-8">
                        <h1 className="text-xl font-semibold text-gray-900 mb-0">Edit Vehicle</h1>
                    </div>
                    <div className="bg-white rounded-2xl shadow border border-gray-100 px-6 py-8">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <ModernInput
                                    label="Vehicle Number"
                                    name="number"
                                    value={formData.number}
                                    onChange={handleChange}
                                    placeholder="e.g., MH12AB1234"
                                    required
                                />
                            </div>
                            <div>
                                <ModernInput
                                    label="Model"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    placeholder="e.g., Tata 407"
                                    required
                                />
                            </div>
                            <div>
                                <ModernInput
                                    label="Capacity (tons)"
                                    name="capacity"
                                    type="number"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    placeholder="e.g., 5"
                                    min="0.1"
                                    step="0.1"
                                    required
                                />
                            </div>
                            <div className="flex items-center mt-6">
                                <input
                                    type="checkbox"
                                    name="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    id="isAvailable"
                                />
                                <label htmlFor="isAvailable" className="ml-2 block text-sm font-semibold">
                                    Available for assignment
                                </label>
                            </div>
                            <div className="md:col-span-2 flex flex-wrap gap-3 justify-end mt-4">
                                <ModernButton
                                    type="button"
                                    variant="secondary"
                                    onClick={() => navigate('/vehicles')}
                                    className="text-sm font-medium rounded-lg px-4 py-2 shadow-none"
                                >
                                    Cancel
                                </ModernButton>
                                <ModernButton
                                    type="submit"
                                    variant="primary"
                                    loading={submitting}
                                    className="text-sm px-4 py-2"
                                >
                                    {submitting ? 'Updating Vehicle...' : 'Update Vehicle'}
                                </ModernButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 