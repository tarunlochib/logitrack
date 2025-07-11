import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import ModernInput from "../components/ModernInput";
import ModernSelect from "../components/ModernSelect";
import ModernButton from "../components/ModernButton";

export default function AddDriver() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        licenseNumber: "",
        vehicleId: "",
    });
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [vehiclesLoading, setVehiclesLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch available vehicles
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5000/api/vehicles", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Filter only available vehicles
                const availableVehicles = response.data.filter(vehicle => vehicle.isAvailable);
                setVehicles(availableVehicles);
            } catch (error) {
                console.error("Error fetching vehicles:", error);
            } finally {
                setVehiclesLoading(false);
            }
        };

        fetchVehicles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            alert("Please enter the driver's name.");
            return false;
        }
        if (!formData.phone.trim()) {
            alert("Please enter the driver's phone number.");
            return false;
        }
        if (!formData.licenseNumber.trim()) {
            alert("Please enter the driver's license number.");
            return false;
        }
        // Phone number validation (basic)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone.trim())) {
            alert("Please enter a valid 10-digit phone number.");
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
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            licenseNumber: formData.licenseNumber.trim(),
            vehicleId: formData.vehicleId || null,
        };

        try {
            const token = localStorage.getItem("token");
            await axios.post("http://localhost:5000/api/drivers", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert("Driver added successfully");
            navigate("/drivers");
        } catch (error) {
            if (
                error.response?.data?.message?.includes("Unique constraint failed") &&
                error.response?.data?.message?.includes("phone")
            ) {
                alert("A driver with this phone number already exists. Please use a unique phone number.");
            } else if (
                error.response?.data?.message?.includes("Unique constraint failed") &&
                error.response?.data?.message?.includes("licenseNumber")
            ) {
                alert("A driver with this license number already exists. Please use a unique license number.");
            } else {
                alert("Failed to add driver. Please try again.");
            }
            console.error("Error adding driver:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-h-[calc(100vh-100px)] overflow-y-auto p-4 bg-white/80 border border-gray-100 rounded-2xl shadow-md">
                <h1 className="text-2xl font-bold mb-6">Add New Driver</h1>
                <form onSubmit={handleSubmit} className="max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <ModernInput
                                label="Driver Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., John Doe"
                                required
                            />
                        </div>
                        <div>
                            <ModernInput
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g., 9876543210"
                                pattern="[0-9]{10}"
                                required
                            />
                        </div>
                        <div>
                            <ModernInput
                                label="License Number"
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                placeholder="e.g., DL1234567890123"
                                required
                            />
                        </div>
                        <div>
                            <ModernSelect
                                label="Assign Vehicle (Optional)"
                                name="vehicleId"
                                value={formData.vehicleId}
                                onChange={handleChange}
                                options={vehicles.map(vehicle => ({
                                    value: vehicle.id,
                                    label: `${vehicle.number} - ${vehicle.model} (${vehicle.capacity} tons)`
                                }))}
                                placeholder={vehiclesLoading ? "Loading vehicles..." : "Select a vehicle (optional)"}
                                disabled={vehiclesLoading}
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
                            {loading ? "Adding Driver..." : "Add Driver"}
                        </ModernButton>
                        <ModernButton
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => navigate("/drivers")}
                        >
                            Cancel
                        </ModernButton>
                    </div>
                </form>
            </div>
        </Layout>
    );
} 