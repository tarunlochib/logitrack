import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import Layout from "../components/Layout";
import ModernInput from "../components/ModernInput";
import ModernSelect from "../components/ModernSelect";
import ModernButton from "../components/ModernButton";
import toast from 'react-hot-toast';

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

    // Fetch vehicles and driver data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch vehicles
                const vehiclesResponse = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles`);
                const vehiclesData = await vehiclesResponse.json();
                setVehicles(vehiclesData);

                // Fetch driver data
                const driverResponse = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/${id}`);
                const driver = await driverResponse.json();
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
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error("Please enter the driver's name.");
            return false;
        }
        if (!formData.phone.trim()) {
            toast.error("Please enter the driver's phone number.");
            return false;
        }
        if (!formData.licenseNumber.trim()) {
            toast.error("Please enter the driver's license number.");
            return false;
        }
        // Phone number validation (basic)
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phone.trim())) {
            toast.error("Please enter a valid 10-digit phone number.");
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
            await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            toast.success("Driver updated successfully");
            navigate(`/drivers/${id}`);
        } catch (error) {
            toast.error("Failed to update driver. Please try again.");
            console.error("Error updating driver:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 text-lg">Loading driver details...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                        <div className="text-center py-12">
                            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-6">
                                <div className="flex items-center justify-center mb-2">
                                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold">Error Loading Driver</span>
                                </div>
                                <p>{error}</p>
                            </div>
                            <ModernButton
                                variant="secondary"
                                size="lg"
                                onClick={() => navigate("/drivers")}
                                className="flex items-center space-x-2 mx-auto"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span>Back to Drivers</span>
                            </ModernButton>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                {/* Modern Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Edit Driver</h1>
                                <p className="text-gray-600 mt-1">Update driver information and vehicle assignment</p>
                            </div>
                        </div>
                        <ModernButton
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/drivers/${id}`)}
                            className="flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View Details</span>
                        </ModernButton>
                    </div>
                </div>

                {/* Form Card */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Driver Information</h2>
                            <p className="text-gray-600">Update the driver's personal and contact details</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Personal Information */}
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                                        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            Personal Details
                                        </h3>
                                        <div className="space-y-4">
                                            <ModernInput
                                                label="Driver Name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g., John Doe"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact & License Information */}
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                                        <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            Contact & License
                                        </h3>
                                        <div className="space-y-4">
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
                                            <ModernInput
                                                label="License Number"
                                                name="licenseNumber"
                                                value={formData.licenseNumber}
                                                onChange={handleChange}
                                                placeholder="e.g., DL1234567890123"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Assignment */}
                            <div className="mt-8">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                                    <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                        <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Vehicle Assignment
                                    </h3>
                                    <p className="text-gray-600 mb-4">Assign or change the driver's vehicle</p>
                                    <ModernSelect
                                        label="Select Vehicle"
                                        name="vehicleId"
                                        value={formData.vehicleId}
                                        onChange={handleChange}
                                        options={[
                                            { value: "", label: "No Vehicle Assigned" },
                                            ...vehicles.map(v => ({ 
                                                value: v.id.toString(), 
                                                label: `${v.number} - ${v.model} (${v.capacity} tons)` 
                                            }))
                                        ]}
                                        placeholder={vehiclesLoading ? "Loading vehicles..." : "Choose a vehicle"}
                                        disabled={vehiclesLoading}
                                    />
                                    {vehicles.length === 0 && !vehiclesLoading && (
                                        <p className="text-sm text-gray-500 mt-2">No vehicles available in the system.</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
                                <ModernButton
                                    type="button"
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => navigate(-1)}
                                    className="flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Cancel</span>
                                </ModernButton>
                                <ModernButton
                                    type="submit"
                                    variant="primary"
                                    className="text-sm px-4 py-2 flex items-center justify-center space-x-2"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Updating Driver...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Update Driver</span>
                                        </>
                                    )}
                                </ModernButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 