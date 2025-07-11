import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import ModernTable from "../components/ModernTable";
import StatusBadge from "../components/StatusBadge";
import ModernButton from "../components/ModernButton";

export default function Vehicles() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchVehicles = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setVehicles(response.data);
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleRowClick = (vehicleId) => {
        navigate(`/vehicles/${vehicleId}`);
    };

    const handleDelete = async (e, vehicleId) => {
        e.stopPropagation(); // Prevent row click
        if (window.confirm("Are you sure you want to delete this vehicle?")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles/${vehicleId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                alert("Vehicle deleted successfully");
                fetchVehicles(); // Refresh the list
            } catch (error) {
                console.error("Error deleting vehicle:", error);
                alert("Failed to delete vehicle. Please try again.");
            }
        }
    };

    return (
        <Layout>
            <div className="px-2 sm:px-4 md:px-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Vehicles</h1>
                    <ModernButton 
                        onClick={() => navigate("/vehicles/new")}
                        variant="primary"
                    >
                        + Add New Vehicle
                    </ModernButton>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading vehicles...</span>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No vehicles found</p>
                        <ModernButton 
                            onClick={() => navigate("/vehicles/new")}
                            variant="primary"
                            className="mt-4"
                        >
                            Add Your First Vehicle
                        </ModernButton>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto rounded-xl bg-white">
                        <ModernTable
                            columns={[
                                { label: "Vehicle Number", key: "number", className: "text-sm px-4 py-3" },
                                { label: "Model", key: "model", className: "text-sm px-4 py-3" },
                                { label: "Capacity", key: "capacity", className: "text-sm px-4 py-3" },
                                { label: "Status", key: "status", className: "text-sm px-4 py-3" },
                                { label: "Driver", key: "driver", className: "text-sm px-4 py-3" },
                            ]}
                            data={vehicles}
                            renderCell={(row, col) => {
                                if (col.key === "capacity") {
                                    return <span>{row.capacity} tons</span>;
                                }
                                if (col.key === "status") {
                                    return <StatusBadge status={row.isAvailable ? 'Available' : 'In Use'} type={row.isAvailable ? 'completed' : 'pending'} />;
                                }
                                if (col.key === "driver") {
                                    return <span>{row.driver ? row.driver.name : 'No Driver Assigned'}</span>;
                                }
                                return row[col.key];
                            }}
                            actions={(row) => (
                                <div className="flex items-center gap-2 justify-center">
                                    <ModernButton
                                        onClick={e => { e.stopPropagation(); navigate(`/vehicles/${row.id}/edit`); }}
                                        variant="secondary"
                                        size="xs"
                                        className="px-2 py-1 text-xs"
                                    >
                                        Edit
                                    </ModernButton>
                                    <ModernButton
                                        onClick={e => { e.stopPropagation(); handleDelete(e, row.id); }}
                                        variant="danger"
                                        size="xs"
                                        className="px-2 py-1 text-xs"
                                    >
                                        Delete
                                    </ModernButton>
                                </div>
                            )}
                            onRowClick={row => handleRowClick(row.id)}
                        />
                    </div>
                )}
            </div>
        </Layout>
    );
} 