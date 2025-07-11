import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5000/api/vehicles", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert("Vehicle added successfully");
            navigate("/vehicles");
        } catch (error) {
            if (
                error.response?.data?.message?.includes("Unique constraint failed") &&
                error.response?.data?.message?.includes("number")
            ) {
                alert("A vehicle with this number already exists. Please use a unique vehicle number.");
            } else {
                alert("Failed to add vehicle. Please try again.");
            }
            console.error("Error adding vehicle:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-h-[calc(100vh-100px)] overflow-y-auto p-4 bg-white/80 border border-gray-100 rounded-2xl shadow-md">
                <h1 className="text-2xl font-bold mb-6">Add New Vehicle</h1>
                <form onSubmit={handleSubmit} className="max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>
                    <div className="mt-6 flex space-x-4">
                        <ModernButton
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={loading}
                        >
                            {loading ? "Adding Vehicle..." : "Add Vehicle"}
                        </ModernButton>
                        <ModernButton
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => navigate("/vehicles")}
                        >
                            Cancel
                        </ModernButton>
                    </div>
                </form>
            </div>
        </Layout>
    );
} 