import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import StatusBadge from "../components/StatusBadge";
import ModernButton from "../components/ModernButton";
import ModernTable from "../components/ModernTable";

export default function ShipmentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const statusColors = {
        PENDING: 'bg-blue-100 text-blue-800',
        IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
        COMPLETED: 'bg-green-100 text-green-800',
        DELIVERED: 'bg-purple-100 text-purple-800',
    };
    const statusOptions = [
        { value: 'PENDING', label: 'Pending' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'DELIVERED', label: 'Delivered' },
    ];
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        const fetchShipment = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get(`http://localhost:5000/api/shipments/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setShipment(res.data);
            } catch (error) {
                console.error("❌ Error fetching shipment:", error);
                setError("Failed to load shipment details. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchShipment();
    }, [id, token]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this shipment? This action cannot be undone.")) {
            return;
        }

        setDeleting(true);
        try {
            await axios.delete(`http://localhost:5000/api/shipments/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert("Shipment deleted successfully");
            navigate("/shipments");
        } catch (error) {
            console.error("Error deleting shipment:", error);
            alert("Failed to delete shipment. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    const handleMarkCompleted = async () => {
        setCompleting(true);
        try {
            await axios.patch(`http://localhost:5000/api/shipments/${id}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Refresh shipment details
            const res = await axios.get(`http://localhost:5000/api/shipments/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShipment(res.data);
            alert('Shipment marked as completed!');
        } catch (error) {
            alert('Failed to mark as completed.');
        } finally {
            setCompleting(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/shipments/${id}/pdf`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const contentType = response.headers.get("content-type");
            if (!response.ok || !contentType || !contentType.includes("application/pdf")) {
                // Try to parse error message
                let errorMsg = `Failed to download PDF. (HTTP ${response.status})`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) errorMsg += `\n${errorData.message}`;
                } catch (e) {
                    // Not JSON, fallback
                }
                alert(errorMsg);
                return;
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `shipment-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Failed to download PDF. Please try again.");
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        setStatusUpdating(true);
        try {
            await axios.patch(`http://localhost:5000/api/shipments/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Refresh shipment details
            const res = await axios.get(`http://localhost:5000/api/shipments/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShipment(res.data);
            alert('Shipment status updated!');
        } catch (error) {
            alert('Failed to update status.');
        } finally {
            setStatusUpdating(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className="p-6">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading shipment details...</span>
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
                        onClick={() => navigate("/shipments")}
                        className="ml-4 text-red-600 hover:text-red-800 underline"
                    >
                        Back to Shipments
                    </button>
                </div>
            </div>
        </Layout>
    );

    if (!shipment) return (
        <Layout>
            <div className="p-6">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    Shipment not found.
                    <button 
                        onClick={() => navigate("/shipments")}
                        className="ml-4 text-yellow-600 hover:text-yellow-800 underline"
                    >
                        Back to Shipments
                    </button>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <h2 className="text-2xl font-bold">Shipment Details</h2>
                        {shipment.status && (
                          <StatusBadge status={shipment.status.replace('_', ' ')} type={shipment.status?.toLowerCase()} />
                        )}
                        {user && ['SUPERADMIN', 'ADMIN', 'DISPATCHER'].includes(user.role) && (
                          <select
                            value={shipment.status}
                            onChange={handleStatusChange}
                            disabled={statusUpdating}
                            className="ml-2 px-2 py-1 border rounded text-sm"
                          >
                            {statusOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center justify-end">
                        {user && user.role !== 'DRIVER' && (
                          <ModernButton 
                              onClick={() => navigate(`/shipments/${id}/edit`)}
                              variant="primary"
                              size="md"
                          >
                              Edit Shipment
                          </ModernButton>
                        )}
                        <ModernButton 
                            onClick={handleDownloadPDF}
                            variant="secondary"
                            size="md"
                        >
                            Download PDF
                        </ModernButton>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl border border-gray-100 shadow p-5 space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Basic Information</h3>
                        <div><span className="font-semibold">Bill Number:</span> <span className="text-blue-700 text-lg font-bold">{shipment.billNo}</span></div>
                        <div><span className="font-semibold">Date:</span> {new Date(shipment.date).toLocaleDateString()}</div>
                        <div><span className="font-semibold">Transport Name:</span> {shipment.transportName}</div>
                        <div><span className="font-semibold">Payment Method:</span> <span className="capitalize">{shipment.paymentMethod.toLowerCase().replace('_', ' ')}</span></div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow p-5 space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Goods Information</h3>
                        <div><span className="font-semibold">Goods Type:</span> {shipment.goodsType}</div>
                        <div><span className="font-semibold">Goods Description:</span> {shipment.goodsDescription}</div>
                        <div><span className="font-semibold">Weight:</span> {shipment.weight} kg</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow p-5 space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Consignor</h3>
                        <div><span className="font-semibold">Name:</span> {shipment.consignorName}</div>
                        <div><span className="font-semibold">Address:</span> {shipment.consignorAddress}</div>
                        <div><span className="font-semibold">GST No:</span> {shipment.consignorGstNo}</div>
                        <div><span className="font-semibold">Source:</span> {shipment.source}</div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 shadow p-5 space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Consignee</h3>
                        <div><span className="font-semibold">Name:</span> {shipment.consigneeName}</div>
                        <div><span className="font-semibold">Address:</span> {shipment.consigneeAddress}</div>
                        <div><span className="font-semibold">GST No:</span> {shipment.consigneeGstNo}</div>
                        <div><span className="font-semibold">Destination:</span> {shipment.destination}</div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow p-5 mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Charges</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div><span className="font-semibold">Freight Charges:</span> ₹{shipment.freightCharges}</div>
                        <div><span className="font-semibold">Local Cartage Charges:</span> ₹{shipment.localCartageCharges}</div>
                        <div><span className="font-semibold">Hamali Charges:</span> ₹{shipment.hamaliCharges}</div>
                        <div><span className="font-semibold">Stationary Charges:</span> ₹{shipment.stationaryCharges}</div>
                        <div><span className="font-semibold">Door Delivery Charges:</span> ₹{shipment.doorDeliveryCharges}</div>
                        <div><span className="font-semibold">Other Charges:</span> ₹{shipment.otherCharges}</div>
                        <div className="col-span-1 md:col-span-2 text-xl font-bold text-green-700 mt-2"><span className="font-semibold">Grand Total:</span> ₹{shipment.grandTotal}</div>
                    </div>
                </div>
                {shipment.items && shipment.items.length > 0 && (
                    <div className="w-full overflow-x-auto rounded-xl bg-white">
                        <ModernTable
                            columns={[
                                { label: "Item", key: "item" },
                                { label: "Quantity", key: "quantity" },
                                { label: "Weight", key: "weight" },
                                { label: "Rate", key: "rate" },
                                { label: "Amount", key: "amount" },
                            ]}
                            data={shipment.items}
                            renderCell={(row, col) => row[col.key]}
                        />
                    </div>
                )}
                <div className="flex flex-wrap gap-4 justify-end">
                    {user && user.role !== 'DRIVER' && (
                        <ModernButton
                            onClick={handleDelete}
                            variant="danger"
                            size="md"
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete Shipment"}
                        </ModernButton>
                    )}
                    {user && user.role === 'DRIVER' && shipment.status !== 'COMPLETED' && (
                        <ModernButton
                            onClick={handleMarkCompleted}
                            variant="primary"
                            size="md"
                            disabled={completing}
                        >
                            {completing ? "Marking..." : "Mark as Completed"}
                        </ModernButton>
                    )}
                </div>
            </div>
        </Layout>
    );
}