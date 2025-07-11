import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import ModernCard from "../components/ModernCard";
import ModernTable from "../components/ModernTable";
import StatusBadge from "../components/StatusBadge";
import ModernButton from "../components/ModernButton";

export default function VehicleDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get(`http://localhost:5000/api/vehicles/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setVehicle(res.data);
            } catch (error) {
                console.error("❌ Error fetching vehicle:", error);
                setError("Failed to load vehicle details. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchVehicle();
    }, [id, token]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
            return;
        }

        setDeleting(true);
        try {
            await axios.delete(`http://localhost:5000/api/vehicles/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert("Vehicle deleted successfully");
            navigate("/vehicles");
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            alert("Failed to delete vehicle. Please try again.");
        } finally {
            setDeleting(false);
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

    if (!vehicle) return (
        <Layout>
            <div className="p-6">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    Vehicle not found.
                    <button 
                        onClick={() => navigate("/vehicles")}
                        className="ml-4 text-yellow-600 hover:text-yellow-800 underline"
                    >
                        Back to Vehicles
                    </button>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Vehicle Details</h2>
                    <ModernButton 
                        onClick={() => navigate(`/vehicles/${id}/edit`)}
                        variant="primary"
                        size="md"
                    >
                        Edit Vehicle
                    </ModernButton>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <ModernCard
                        label={<span className="text-white drop-shadow">Vehicle Number</span>}
                        value={<span className="text-white font-semibold drop-shadow">{vehicle.number}</span>}
                        gradient="from-blue-700 to-blue-500"
                    />
                    <ModernCard
                        label={<span className="text-white drop-shadow">Model</span>}
                        value={<span className="text-white font-bold drop-shadow">{vehicle.model}</span>}
                        gradient="from-cyan-700 to-blue-500"
                    />
                    <ModernCard
                        label={<span className="text-white drop-shadow">Capacity</span>}
                        value={<span className="text-white font-bold drop-shadow">{vehicle.capacity} tons</span>}
                        gradient="from-green-700 to-green-500"
                    />
                    <ModernCard
                        label={<span className="text-white drop-shadow">Status</span>}
                        value={<span className="font-bold text-white text-lg drop-shadow">{vehicle.isAvailable ? 'Available' : 'In Use'}</span>}
                        gradient={vehicle.isAvailable ? "from-green-600 to-green-800" : "from-red-600 to-red-800"}
                    />
                    <ModernCard
                        label={<span className="text-white drop-shadow">Created</span>}
                        value={<span className="text-white font-semibold drop-shadow">{new Date(vehicle.createdAt).toLocaleDateString()}</span>}
                        gradient="from-gray-700 to-gray-500"
                    />
                </div>
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Assigned Driver</h3>
                        {vehicle.driver ? null : (
                            <ModernButton
                                onClick={() => navigate("/drivers")}
                                variant="primary"
                                size="sm"
                            >
                                Assign Driver
                            </ModernButton>
                        )}
                    </div>
                    {vehicle.driver ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/80 border border-gray-100 rounded-2xl shadow p-4">
                            <div><strong>Name:</strong> {vehicle.driver.name}</div>
                            <div><strong>Phone:</strong> {vehicle.driver.phone}</div>
                            <div><strong>License Number:</strong> {vehicle.driver.licenseNumber}</div>
                            <div><strong>Assigned Since:</strong> {new Date(vehicle.driver.createdAt).toLocaleDateString()}</div>
                        </div>
                    ) : (
                        <div className="text-gray-500 bg-white/80 border border-gray-100 rounded-2xl shadow p-4">
                            No driver assigned to this vehicle.
                        </div>
                    )}
                </div>
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Shipments</h3>
                    {vehicle.Shipment && vehicle.Shipment.length > 0 ? (
                        <div className="w-full overflow-x-auto rounded-xl bg-white">
                            <ModernTable
                                columns={[
                                    { label: "Bill No", key: "billNo" },
                                    { label: "Date", key: "date" },
                                    { label: "Source", key: "source" },
                                    { label: "Destination", key: "destination" },
                                    { label: "Amount", key: "grandTotal" },
                                ]}
                                data={vehicle.Shipment}
                                renderCell={(row, col) => {
                                    if (col.key === "date") {
                                        return new Date(row.date).toLocaleDateString();
                                    }
                                    if (col.key === "grandTotal") {
                                        return <span className="font-semibold text-green-600">₹{row.grandTotal}</span>;
                                    }
                                    return row[col.key];
                                }}
                                onRowClick={row => navigate(`/shipments/${row.id}`)}
                            />
                        </div>
                    ) : (
                        <div className="text-gray-500">No shipments found for this vehicle.</div>
                    )}
                </div>
                <div className="flex justify-end gap-4">
                    <ModernButton
                        onClick={handleDelete}
                        variant="danger"
                        size="md"
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Delete Vehicle"}
                    </ModernButton>
                    <ModernButton
                        onClick={() => navigate("/vehicles")}
                        variant="secondary"
                        size="md"
                    >
                        Back to Vehicles
                    </ModernButton>
                </div>
            </div>
        </Layout>
    );
} 