import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ModernButton from "../components/ModernButton";
import StatusBadge from "../components/StatusBadge";
import { apiFetch } from "../api";
import { FaTruck, FaUser, FaCalendarAlt, FaCog, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

export default function VehicleDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles/${id}`);
                const data = await res.json();
                setVehicle(data);
            } catch (error) {
                console.error("Error fetching vehicle:", error);
                setError("Failed to fetch vehicle details");
            } finally {
                setLoading(false);
            }
        };

        fetchVehicle();
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this vehicle?")) {
            try {
                await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles/${id}`, {
                    method: 'DELETE',
                });
                alert("Vehicle deleted successfully");
                navigate("/vehicles");
            } catch (error) {
                console.error("Error deleting vehicle:", error);
                alert("Failed to delete vehicle. Please try again.");
            }
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading vehicle details...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                        <div className="text-red-600 text-6xl mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Vehicle</h3>
                        <p className="text-red-600 mb-6">{error}</p>
                        <ModernButton 
                            onClick={() => navigate("/vehicles")}
                            variant="primary"
                            className="text-sm px-4 py-2"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Vehicles
                        </ModernButton>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!vehicle) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 max-w-md mx-auto">
                        <div className="text-yellow-600 text-6xl mb-4">🚛</div>
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Vehicle Not Found</h3>
                        <p className="text-yellow-600 mb-6">The vehicle you're looking for doesn't exist.</p>
                        <ModernButton 
                            onClick={() => navigate("/vehicles")}
                            variant="primary"
                            className="text-sm px-4 py-2"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Vehicles
                        </ModernButton>
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
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate("/vehicles")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Vehicle Details</h1>
                                <p className="text-gray-600">Manage and view vehicle information</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <ModernButton 
                                onClick={() => navigate(`/vehicles/${id}/edit`)}
                                variant="primary"
                                className="text-sm px-4 py-2"
                            >
                                <FaEdit className="mr-2" />
                                Edit Vehicle
                            </ModernButton>
                            <ModernButton 
                                onClick={handleDelete}
                                variant="secondary"
                                className="text-sm px-4 py-2 text-red-600 hover:text-red-700"
                            >
                                <FaTrash className="mr-2" />
                                Delete
                            </ModernButton>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Vehicle Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vehicle Overview Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <FaTruck className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{vehicle.number}</h2>
                                        <p className="text-gray-600">{vehicle.model}</p>
                                    </div>
                                </div>
                                <StatusBadge 
                                    status={vehicle.isAvailable ? 'Available' : 'In Use'} 
                                    type={vehicle.isAvailable ? 'completed' : 'pending'} 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                                        <p className="text-lg font-semibold text-gray-900">{vehicle.number}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                        <p className="text-lg font-semibold text-gray-900">{vehicle.model}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                        <p className="text-lg font-semibold text-gray-900">{vehicle.capacity} tons</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {new Date(vehicle.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Shipments */}
                        {vehicle.Shipment && vehicle.Shipment.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Shipments</h3>
                                <div className="space-y-3">
                                    {vehicle.Shipment.slice(0, 5).map((shipment) => (
                                        <div 
                                            key={shipment.id}
                                            onClick={() => navigate(`/shipments/${shipment.id}`)}
                                            className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-900">{shipment.billNo}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {shipment.source} → {shipment.destination}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-green-600">₹{shipment.grandTotal}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(shipment.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Driver Assignment Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FaUser className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Driver Assignment</h3>
                            </div>
                            
                            {vehicle.driver ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <FaUser className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-green-900">{vehicle.driver.name}</p>
                                                <p className="text-sm text-green-700">{vehicle.driver.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">License Number:</span>
                                            <span className="font-medium text-gray-900">{vehicle.driver.licenseNumber}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Assigned Since:</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(vehicle.driver.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <FaUser className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-600 mb-4">No driver assigned to this vehicle</p>
                                    <ModernButton 
                                        onClick={() => navigate("/drivers")}
                                        variant="primary"
                                        className="text-sm px-4 py-2"
                                    >
                                        Assign Driver
                                    </ModernButton>
                                </div>
                            )}
                        </div>

                        {/* Vehicle Statistics */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-cyan-100 rounded-lg">
                                    <FaCog className="w-5 h-5 text-cyan-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Statistics</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">Total Shipments</span>
                                    <span className="font-semibold text-gray-900">
                                        {vehicle.Shipment ? vehicle.Shipment.length : 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">Status</span>
                                    <StatusBadge 
                                        status={vehicle.isAvailable ? 'Available' : 'In Use'} 
                                        type={vehicle.isAvailable ? 'completed' : 'pending'} 
                                    />
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">Capacity</span>
                                    <span className="font-semibold text-gray-900">{vehicle.capacity} tons</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 