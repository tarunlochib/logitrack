import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import Layout from "../components/Layout";
import ModernInput from "../components/ModernInput";
import ModernButton from "../components/ModernButton";

export default function AddVehicle() {
    const [formData, setFormData] = useState({
        number: "",
        model: "",
        capacity: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.number.trim()) {
            alert("Please enter the vehicle number.");
            return false;
        }
        if (!formData.model.trim()) {
            alert("Please enter the vehicle model.");
            return false;
        }
        if (!formData.capacity || Number(formData.capacity) <= 0) {
            alert("Please enter a valid capacity (greater than 0).");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        const payload = {
            number: formData.number.trim(),
            model: formData.model.trim(),
            capacity: Number(formData.capacity),
        };

        try {
            await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles`, {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            alert("Vehicle added successfully");
            navigate("/vehicles");
        } catch (error) {
            alert("Failed to add vehicle. Please try again.");
            console.error("Error adding vehicle:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-2xl shadow border border-gray-100 px-6 py-6 mb-8">
                        <h1 className="text-xl font-semibold text-gray-900 mb-0">Add New Vehicle</h1>
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
                                    loading={loading}
                                    className="text-sm font-medium rounded-lg px-4 py-2 shadow-none"
                                >
                                    {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
                                </ModernButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 