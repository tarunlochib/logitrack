import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ModernButton from "../components/ModernButton";
import StatusBadge from "../components/StatusBadge";
import ModernSelect from "../components/ModernSelect";
import { apiFetch } from "../api";
import { FaUser, FaPhone, FaIdCard, FaTruck, FaCalendarAlt, FaCog, FaEdit, FaTrash, FaArrowLeft, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function DriverDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [driverRes, vehiclesRes] = await Promise.all([
                    apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/${id}`),
                    apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles`)
                ]);
                
                const driverData = await driverRes.json();
                const vehiclesData = await vehiclesRes.json();
                
                setDriver(driverData);
                setVehicles(vehiclesData);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to fetch driver details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAssignVehicle = async (vehicleId) => {
        if (!vehicleId) return;
        
        setAssigning(true);
        try {
            await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/assign`, {
                method: 'POST',
                body: JSON.stringify({ driverId: id, vehicleId })
            });
            
            // Refresh driver data
            const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/${id}`);
            const updatedDriver = await res.json();
            setDriver(updatedDriver);
            
            toast.success("Vehicle assigned successfully");
        } catch (error) {
            console.error("Error assigning vehicle:", error);
            toast.error("Failed to assign vehicle. Please try again.");
        } finally {
            setAssigning(false);
        }
    };

    const handleUnassignVehicle = async () => {
        setAssigning(true);
        try {
            await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/${id}/unassign`, {
                method: 'POST',
                body: JSON.stringify({})
            });
            
            // Refresh driver data
            const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/${id}`);
            const updatedDriver = await res.json();
            setDriver(updatedDriver);
            
            toast.success("Vehicle unassigned successfully");
        } catch (error) {
            console.error("Error unassigning vehicle:", error);
            toast.error("Failed to unassign vehicle. Please try again.");
        } finally {
            setAssigning(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this driver?")) {
            try {
                await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/${id}`, {
                    method: 'DELETE'
                });
                toast.success("Driver deleted successfully");
                navigate("/drivers");
            } catch (error) {
                console.error("Error deleting driver:", error);
                toast.error("Failed to delete driver. Please try again.");
            }
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading driver details...</p>
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
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Driver</h3>
                        <p className="text-red-600 mb-6">{error}</p>
                        <ModernButton 
                            onClick={() => navigate("/drivers")}
                            variant="primary"
                            className="text-sm px-4 py-2"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Drivers
                        </ModernButton>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!driver) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 max-w-md mx-auto">
                        <div className="text-yellow-600 text-6xl mb-4">👨‍💼</div>
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Driver Not Found</h3>
                        <p className="text-yellow-600 mb-6">The driver you're looking for doesn't exist.</p>
                        <ModernButton 
                            onClick={() => navigate("/drivers")}
                            variant="primary"
                            className="text-sm px-4 py-2"
                        >
                            <FaArrowLeft className="mr-2" />
                            Back to Drivers
                        </ModernButton>
                    </div>
                </div>
            </Layout>
        );
    }

    const availableVehicles = vehicles.filter(v => !v.driver && v.isAvailable);

    return (
        <Layout>
            <div className="px-2 sm:px-4 md:px-6 py-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate("/drivers")}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <FaArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Driver Details</h1>
                                <p className="text-gray-600">Manage and view driver information</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <ModernButton 
                                onClick={() => navigate(`/drivers/${id}/edit`)}
                                variant="primary"
                                className="text-sm px-4 py-2"
                            >
                                <FaEdit className="mr-2" />
                                Edit Driver
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
                    {/* Main Driver Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Driver Overview Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-3 bg-purple-100 rounded-xl">
                                        <FaUser className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900">{driver.name}</h2>
                                        <p className="text-gray-600">Driver ID: {driver.id}</p>
                                    </div>
                                </div>
                                <StatusBadge 
                                    status={driver.vehicle ? 'Assigned' : 'Unassigned'} 
                                    type={driver.vehicle ? 'completed' : 'pending'} 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <p className="text-lg font-semibold text-gray-900">{driver.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <div className="flex items-center space-x-2">
                                            <FaPhone className="w-4 h-4 text-gray-400" />
                                            <p className="text-lg font-semibold text-gray-900">{driver.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                                        <div className="flex items-center space-x-2">
                                            <FaIdCard className="w-4 h-4 text-gray-400" />
                                            <p className="text-lg font-semibold text-gray-900 font-mono">{driver.licenseNumber}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Joined</label>
                                        <div className="flex items-center space-x-2">
                                            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                                            <p className="text-lg font-semibold text-gray-900">
                                                {new Date(driver.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Shipments */}
                        {driver.Shipment && driver.Shipment.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Shipments</h3>
                                <div className="space-y-3">
                                    {driver.Shipment.slice(0, 5).map((shipment) => (
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
                        {/* Vehicle Assignment Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FaTruck className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Vehicle Assignment</h3>
                            </div>
                            
                            {driver.vehicle ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <FaTruck className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-green-900">{driver.vehicle.number}</p>
                                                <p className="text-sm text-green-700">{driver.vehicle.model}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Capacity:</span>
                                            <span className="font-medium text-gray-900">{driver.vehicle.capacity} tons</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Status:</span>
                                            <StatusBadge 
                                                status={driver.vehicle.isAvailable ? 'Available' : 'In Use'} 
                                                type={driver.vehicle.isAvailable ? 'completed' : 'pending'} 
                                            />
                                        </div>
                                    </div>
                                    <ModernButton 
                                        onClick={handleUnassignVehicle}
                                        variant="secondary"
                                        disabled={assigning}
                                        className="text-sm px-4 py-2"
                                    >
                                        {assigning ? 'Unassigning...' : 'Unassign Vehicle'}
                                    </ModernButton>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center py-6">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FaTruck className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600 mb-4">No vehicle assigned to this driver</p>
                                    </div>
                                    {availableVehicles.length > 0 ? (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Assign Vehicle</label>
                                            <ModernSelect
                                                options={availableVehicles.map(v => ({ value: v.id, label: `${v.number} - ${v.model}` }))}
                                                onChange={(e) => handleAssignVehicle(e.target.value)}
                                                placeholder="Select a vehicle"
                                                className="w-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-gray-500 text-sm mb-3">No available vehicles to assign</p>
                                            <ModernButton 
                                                onClick={() => navigate("/vehicles/new")}
                                                variant="primary"
                                                className="text-sm px-4 py-2"
                                            >
                                                <FaPlus className="mr-2" />
                                                Add Vehicle
                                            </ModernButton>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Driver Statistics */}
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
                                        {driver.Shipment ? driver.Shipment.length : 0}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">Status</span>
                                    <StatusBadge 
                                        status={driver.vehicle ? 'Assigned' : 'Unassigned'} 
                                        type={driver.vehicle ? 'completed' : 'pending'} 
                                    />
                                </div>
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <span className="text-gray-600">License</span>
                                    <span className="font-semibold text-gray-900 font-mono text-sm">{driver.licenseNumber}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 