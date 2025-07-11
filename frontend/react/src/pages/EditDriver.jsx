import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import ModernInput from "../components/ModernInput";
import ModernSelect from "../components/ModernSelect";
import ModernButton from "../components/ModernButton";

export default function EditDriver() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        licenseNumber: "",
        vehicleId: "",
    });
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [vehiclesLoading, setVehiclesLoading] = useState(true);
    const token = localStorage.getItem("token");

    // Fetch vehicles and driver data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch vehicles
                const vehiclesResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setVehicles(vehiclesResponse.data);

                // Fetch driver data
                const driverResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const driver = driverResponse.data;
                setFormData({
                    name: driver.name,
                    phone: driver.phone,
                    licenseNumber: driver.licenseNumber,
                    vehicleId: driver.vehicleId ? driver.vehicleId.toString() : "",
                });
            } catch (error) {
                console.error("❌ Error fetching data:", error);
                setError("Failed to load driver details. Please try again.");
            } finally {
                setLoading(false);
                setVehiclesLoading(false);
            }
        };

        fetchData();
    }, [id, token]);

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

        setSubmitting(true);

        const payload = {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            licenseNumber: formData.licenseNumber.trim(),
            vehicleId: formData.vehicleId || null,
        };

        try {
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert("Driver updated successfully");
            navigate(`/drivers/${id}`);
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
                alert("Failed to update driver. Please try again.");
            }
            console.error("Error updating driver:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="p-6">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading driver details...</span>
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
                        onClick={() => navigate("/drivers")}
                        className="ml-4 text-red-600 hover:text-red-800 underline"
                    >
                        Back to Drivers
                    </button>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-h-[calc(100vh-100px)] overflow-y-auto p-4 bg-white/80 border border-gray-100 rounded-2xl shadow-md">
                <h1 className="text-2xl font-bold mb-6">Edit Driver</h1>
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
                                label="Assigned Vehicle"
                                name="vehicleId"
                                value={formData.vehicleId}
                                onChange={handleChange}
                                options={[
                                    { value: "", label: "None" },
                                    ...vehicles.map(v => ({ value: v.id.toString(), label: `${v.number} (${v.model})` }))
                                ]}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col md:flex-row gap-4">
                        <ModernButton
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={submitting}
                            className="w-full md:w-auto"
                        >
                            {submitting ? "Updating Driver..." : "Update Driver"}
                        </ModernButton>
                        <ModernButton
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => navigate(-1)}
                            className="w-full md:w-auto"
                        >
                            Cancel
                        </ModernButton>
                    </div>
                </form>
            </div>
        </Layout>
    );
} 