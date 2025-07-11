import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import ModernCard from "../components/ModernCard";
import ModernTable from "../components/ModernTable";
import StatusBadge from "../components/StatusBadge";
import ModernButton from "../components/ModernButton";
import ModernModal from "../components/ModernModal";
import ModernSelect from "../components/ModernSelect";

export default function DriverDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get(`http://localhost:5000/api/drivers/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setDriver(res.data);
            } catch (error) {
                console.error("❌ Error fetching driver:", error);
                setError("Failed to load driver details. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchDriver();
    }, [id, token]);

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/vehicles", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setVehicles(response.data);
            } catch (error) {
                console.error("Error fetching vehicles:", error);
            }
        };
        fetchVehicles();
    }, [token]);

    const handleAssignVehicle = async () => {
        if (!selectedVehicleId) {
            alert("Please select a vehicle to assign.");
            return;
        }

        setAssigning(true);
        try {
            await axios.post("http://localhost:5000/api/drivers/assign", 
                { driverId: id, vehicleId: selectedVehicleId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Driver assigned to vehicle successfully!");
            setShowAssignmentModal(false);
            setSelectedVehicleId("");
            // Refresh driver data
            const res = await axios.get(`http://localhost:5000/api/drivers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDriver(res.data);
        } catch (error) {
            console.error("Error assigning driver:", error);
            alert(error.response?.data?.message || "Failed to assign driver to vehicle.");
        } finally {
            setAssigning(false);
        }
    };

    const handleUnassignVehicle = async () => {
        if (!window.confirm("Are you sure you want to unassign this driver from the vehicle?")) {
            return;
        }

        setAssigning(true);
        try {
            await axios.post(`http://localhost:5000/api/drivers/${id}/unassign`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Driver unassigned from vehicle successfully!");
            // Refresh driver data
            const res = await axios.get(`http://localhost:5000/api/drivers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDriver(res.data);
        } catch (error) {
            console.error("Error unassigning driver:", error);
            alert("Failed to unassign driver from vehicle.");
        } finally {
            setAssigning(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this driver? This action cannot be undone.")) {
            return;
        }

        setDeleting(true);
        try {
            await axios.delete(`http://localhost:5000/api/drivers/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert("Driver deleted successfully");
            navigate("/drivers");
        } catch (error) {
            console.error("Error deleting driver:", error);
            alert("Failed to delete driver. Please try again.");
        } finally {
            setDeleting(false);
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

    if (!driver) return (
        <Layout>
            <div className="p-6">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    Driver not found.
                    <button 
                        onClick={() => navigate("/drivers")}
                        className="ml-4 text-yellow-600 hover:text-yellow-800 underline"
                    >
                        Back to Drivers
                    </button>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Driver Details</h2>
                    <ModernButton 
                        onClick={() => navigate(`/drivers/${id}/edit`)}
                        variant="primary"
                        size="md"
                    >
                        Edit Driver
                    </ModernButton>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <ModernCard
                        label="Name"
                        value={<span className="text-blue-100 font-semibold">{driver.name}</span>}
                        gradient="from-blue-500 to-blue-300"
                    />
                    <ModernCard
                        label="Phone"
                        value={driver.phone}
                        gradient="from-blue-400 to-blue-200"
                    />
                    <ModernCard
                        label="License Number"
                        value={driver.licenseNumber}
                        gradient="from-green-500 to-green-300"
                    />
                    <ModernCard
                        label="Created"
                        value={new Date(driver.createdAt).toLocaleDateString()}
                        gradient="from-purple-500 to-purple-300"
                    />
                </div>
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">Assigned Vehicle</h3>
                        {driver.vehicle ? (
                            <ModernButton
                                onClick={handleUnassignVehicle}
                                variant="danger"
                                size="sm"
                                disabled={assigning}
                            >
                                {assigning ? "Unassigning..." : "Unassign Vehicle"}
                            </ModernButton>
                        ) : (
                            <ModernButton
                                onClick={() => setShowAssignmentModal(true)}
                                variant="primary"
                                size="sm"
                            >
                                Assign Vehicle
                            </ModernButton>
                        )}
                    </div>
                    {driver.vehicle ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/80 border border-gray-100 rounded-2xl shadow p-4">
                            <div><strong>Vehicle Number:</strong> {driver.vehicle.number}</div>
                            <div><strong>Model:</strong> {driver.vehicle.model}</div>
                            <div><strong>Capacity:</strong> {driver.vehicle.capacity} tons</div>
                            <div className="flex items-center gap-2"><strong>Status:</strong> <StatusBadge status={driver.vehicle.isAvailable ? 'Available' : 'In Use'} type={driver.vehicle.isAvailable ? 'completed' : 'pending'} /></div>
                        </div>
                    ) : (
                        <div className="text-gray-500 bg-white/80 border border-gray-100 rounded-2xl shadow p-4">
                            No vehicle assigned to this driver.
                        </div>
                    )}
                </div>
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Shipments</h3>
                    {driver.Shipment && driver.Shipment.length > 0 ? (
                        <div className="w-full overflow-x-auto rounded-xl bg-white">
                            <ModernTable
                                columns={[
                                    { label: "Bill No", key: "billNo" },
                                    { label: "Date", key: "date" },
                                    { label: "Source", key: "source" },
                                    { label: "Destination", key: "destination" },
                                    { label: "Status", key: "status" },
                                ]}
                                data={driver.Shipment}
                                renderCell={(row, col) => {
                                    if (col.key === "date") {
                                        return new Date(row.date).toLocaleDateString();
                                    }
                                    if (col.key === "status") {
                                        return <StatusBadge status={row.status} type={row.status?.toLowerCase()} />;
                                    }
                                    return row[col.key];
                                }}
                                onRowClick={row => navigate(`/shipments/${row.id}`)}
                            />
                        </div>
                    ) : (
                        <div className="text-gray-500">No recent shipments for this driver.</div>
                    )}
                </div>
                <div className="flex justify-end gap-4">
                    <ModernButton
                        onClick={handleDelete}
                        variant="danger"
                        size="md"
                        disabled={deleting}
                    >
                        {deleting ? "Deleting..." : "Delete Driver"}
                    </ModernButton>
                </div>
                <ModernModal
                    open={showAssignmentModal}
                    onClose={() => setShowAssignmentModal(false)}
                    title="Assign Vehicle to Driver"
                    actions={[
                        <ModernButton
                            key="assign"
                            onClick={handleAssignVehicle}
                            variant="primary"
                            size="md"
                            disabled={assigning}
                        >
                            {assigning ? "Assigning..." : "Assign"}
                        </ModernButton>,
                        <ModernButton
                            key="cancel"
                            onClick={() => setShowAssignmentModal(false)}
                            variant="secondary"
                            size="md"
                        >
                            Cancel
                        </ModernButton>
                    ]}
                >
                    <ModernSelect
                        label="Select Vehicle"
                        name="vehicleId"
                        value={selectedVehicleId}
                        onChange={e => setSelectedVehicleId(e.target.value)}
                        options={vehicles.filter(v => v.isAvailable || v.id === driver.vehicleId).map(vehicle => ({
                            value: vehicle.id,
                            label: `${vehicle.number} - ${vehicle.model} (${vehicle.capacity} tons)${!vehicle.isAvailable ? ' - In Use' : ''}`
                        }))}
                        placeholder="Select a vehicle"
                    />
                </ModernModal>
            </div>
        </Layout>
    );
} 