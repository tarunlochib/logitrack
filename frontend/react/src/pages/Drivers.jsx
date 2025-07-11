import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import DriverFilter from "../components/DriverFilter";
import ModernTable from "../components/ModernTable";
import StatusBadge from "../components/StatusBadge";
import ModernButton from "../components/ModernButton";

export default function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [filterState, setFilterState] = useState({});

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setDrivers(response.data);
        } catch (error) {
            console.error("Error fetching drivers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const handleRowClick = (driverId) => {
        navigate(`/drivers/${driverId}`);
    };

    const handleDelete = async (e, driverId) => {
        e.stopPropagation(); // Prevent row click
        if (window.confirm("Are you sure you want to delete this driver?")) {
            try {
                const token = localStorage.getItem("token");
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/${driverId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                alert("Driver deleted successfully");
                fetchDrivers(); // Refresh the list
            } catch (error) {
                console.error("Error deleting driver:", error);
                alert("Failed to delete driver. Please try again.");
            }
        }
    };

    const filteredDrivers = drivers.filter((driver) => {
        const { name, phone, licenseNumber, vehicle } = filterState;
        let match = true;
        if (name && !driver.name.toLowerCase().includes(name.toLowerCase())) match = false;
        if (phone && !driver.phone.toLowerCase().includes(phone.toLowerCase())) match = false;
        if (licenseNumber && !driver.licenseNumber.toLowerCase().includes(licenseNumber.toLowerCase())) match = false;
        if (vehicle && (!driver.vehicle || !driver.vehicle.number.toLowerCase().includes(vehicle.toLowerCase()))) match = false;
        return match;
    });

    return (
        <Layout>
            <div className="px-2 sm:px-4 md:px-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Drivers</h1>
                    <ModernButton 
                        onClick={() => navigate("/drivers/new")}
                        variant="primary"
                    >
                        + Add New Driver
                    </ModernButton>
                </div>
                <DriverFilter onFilterChange={setFilterState} />
                
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading drivers...</span>
                    </div>
                ) : drivers.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No drivers found</p>
                        <ModernButton 
                            onClick={() => navigate("/drivers/new")}
                            variant="primary"
                            className="mt-4"
                        >
                            Add Your First Driver
                        </ModernButton>
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto rounded-xl bg-white">
                        <ModernTable
                            columns={[
                                { label: "Name", key: "name", className: "text-sm px-4 py-3" },
                                { label: "Phone", key: "phone", className: "text-sm px-4 py-3" },
                                { label: "License Number", key: "licenseNumber", className: "text-sm px-4 py-3" },
                                { label: "Assigned Vehicle", key: "vehicle", className: "text-sm px-4 py-3" },
                                { label: "Status", key: "status", className: "text-sm px-4 py-3" },
                            ]}
                            data={filteredDrivers}
                            renderCell={(row, col) => {
                                if (col.key === "vehicle") {
                                    return <span>{row.vehicle ? row.vehicle.number : 'No Vehicle Assigned'}</span>;
                                }
                                if (col.key === "status") {
                                    return <StatusBadge status={row.vehicle ? 'Assigned' : 'Unassigned'} type={row.vehicle ? 'completed' : 'pending'} />;
                                }
                                return row[col.key];
                            }}
                            actions={(row) => (
                                <div className="flex items-center gap-2 justify-center">
                                    <ModernButton
                                        onClick={e => { e.stopPropagation(); navigate(`/drivers/${row.id}/edit`); }}
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