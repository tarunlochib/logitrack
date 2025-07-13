import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Layout from '../components/Layout';
import StatusBadge from "../components/StatusBadge";
import ModernButton from "../components/ModernButton";
import ModernTable from "../components/ModernTable";
import { apiFetch } from "../api";

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
                const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${id}`);
                if (!res.ok) throw new Error('Failed to fetch shipment');
                setShipment(await res.json());
            } catch (error) {
                console.error("❌ Error fetching shipment:", error);
                setError("Failed to load shipment details. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchShipment();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this shipment? This action cannot be undone.")) {
            return;
        }

        setDeleting(true);
        try {
            const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete shipment');
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
            const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${id}/complete`, {
                method: 'PATCH',
            });
            if (!res.ok) throw new Error('Failed to mark as completed');
            // Refresh shipment details
            const res2 = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${id}`);
            setShipment(await res2.json());
            alert('Shipment marked as completed!');
        } catch (error) {
            alert('Failed to mark as completed.');
        } finally {
            setCompleting(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${id}/pdf`);
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
            const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            // Refresh shipment details
            const res2 = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${id}`);
            setShipment(await res2.json());
            alert('Shipment status updated!');
        } catch (error) {
            alert('Failed to update status.');
        } finally {
            setStatusUpdating(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600 text-lg">Loading shipment details...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                            <div className="text-center py-12">
                                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-6">
                                    <div className="flex items-center justify-center mb-2">
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-semibold">Error Loading Shipment</span>
                                    </div>
                                    <p>{error}</p>
                                </div>
                                <ModernButton
                                    variant="secondary"
                                    size="md"
                                    onClick={() => navigate("/shipments")}
                                    className="flex items-center space-x-2 mx-auto"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span>Back to Shipments</span>
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!shipment) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                            <div className="text-center py-12">
                                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-2xl mb-6">
                                    <div className="flex items-center justify-center mb-2">
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span className="font-semibold">Shipment Not Found</span>
                                    </div>
                                    <p>Shipment not found.</p>
                                </div>
                                <ModernButton
                                    variant="secondary"
                                    size="md"
                                    onClick={() => navigate("/shipments")}
                                    className="flex items-center space-x-2 mx-auto"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span>Back to Shipments</span>
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Modern Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Shipment #{shipment.billNo}</h1>
                                    <p className="text-gray-600 mt-1">Complete shipment details and information</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                {shipment.status && (
                                    <StatusBadge status={shipment.status.replace('_', ' ')} type={shipment.status?.toLowerCase()} />
                                )}
                                {user && ['SUPERADMIN', 'ADMIN', 'DISPATCHER'].includes(user.role) && (
                                    <select
                                        value={shipment.status}
                                        onChange={handleStatusChange}
                                        disabled={statusUpdating}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                                    >
                                        {statusOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-6 mb-8">
                        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-700">₹{shipment.grandTotal}</div>
                                    <div className="text-sm text-gray-600">Total Amount</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-800">{shipment.weight} kg</div>
                                    <div className="text-sm text-gray-600">Weight</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {user && user.role !== 'DRIVER' && (
                                    <ModernButton 
                                        onClick={() => navigate(`/shipments/${id}/edit`)}
                                        variant="primary"
                                        size="sm"
                                        className="flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span>Edit Shipment</span>
                                    </ModernButton>
                                )}
                                <ModernButton 
                                    onClick={handleDownloadPDF}
                                    variant="secondary"
                                    size="sm"
                                    className="flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Download PDF</span>
                                </ModernButton>
                            </div>
                        </div>
                    </div>

                    {/* Information Cards Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Basic Information */}
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600">Bill Number</span>
                                    <span className="text-blue-700 font-bold text-lg">{shipment.billNo}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600">Date</span>
                                    <span className="text-gray-800">{new Date(shipment.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600">Transport Name</span>
                                    <span className="text-gray-800">{shipment.transportName}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-medium text-gray-600">Payment Method</span>
                                    <span className="capitalize text-gray-800">{shipment.paymentMethod.toLowerCase().replace('_', ' ')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Goods Information */}
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Goods Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600">Goods Type</span>
                                    <span className="text-gray-800">{shipment.goodsType}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600">Weight</span>
                                    <span className="text-gray-800 font-semibold">{shipment.weight} kg</span>
                                </div>
                                <div className="py-2">
                                    <span className="font-medium text-gray-600 block mb-2">Description</span>
                                    <span className="text-gray-800">{shipment.goodsDescription}</span>
                                </div>
                                {shipment.privateMark && (
                                    <div className="py-2">
                                        <span className="font-medium text-gray-600 block mb-2">Private Mark</span>
                                        <span className="text-gray-800">{shipment.privateMark}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Consignor Information */}
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Consignor Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600">Name</span>
                                    <span className="text-gray-800">{shipment.consignorName}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600">GST No</span>
                                    <span className="text-gray-800">{shipment.consignorGstNo}</span>
                                </div>
                                <div className="py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600 block mb-2">Address</span>
                                    <span className="text-gray-800">{shipment.consignorAddress}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-medium text-gray-600">Source</span>
                                    <span className="text-gray-800">{shipment.source}</span>
                                </div>
                            </div>
                        </div>

                        {/* Consignee Information */}
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Consignee Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600">Name</span>
                                    <span className="text-gray-800">{shipment.consigneeName}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600">GST No</span>
                                    <span className="text-gray-800">{shipment.consigneeGstNo}</span>
                                </div>
                                <div className="py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-600 block mb-2">Address</span>
                                    <span className="text-gray-800">{shipment.consigneeAddress}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="font-medium text-gray-600">Destination</span>
                                    <span className="text-gray-800">{shipment.destination}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charges Information */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8 mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">Charges Breakdown</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="font-medium text-gray-600">Freight Charges</span>
                                <span className="text-gray-800">₹{shipment.freightCharges}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="font-medium text-gray-600">Local Cartage</span>
                                <span className="text-gray-800">₹{shipment.localCartageCharges}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="font-medium text-gray-600">Hamali Charges</span>
                                <span className="text-gray-800">₹{shipment.hamaliCharges}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="font-medium text-gray-600">Stationary Charges</span>
                                <span className="text-gray-800">₹{shipment.stationaryCharges}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="font-medium text-gray-600">Door Delivery</span>
                                <span className="text-gray-800">₹{shipment.doorDeliveryCharges}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="font-medium text-gray-600">Other Charges</span>
                                <span className="text-gray-800">₹{shipment.otherCharges}</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-800">Grand Total</span>
                                <span className="text-2xl font-bold text-green-700">₹{shipment.grandTotal}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        {user && user.role !== 'DRIVER' && (
                            <ModernButton 
                                onClick={handleDelete}
                                variant="danger"
                                size="sm"
                                disabled={deleting}
                                className="flex items-center space-x-2"
                            >
                                {deleting ? (
                                    <>
                                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Delete Shipment</span>
                                    </>
                                )}
                            </ModernButton>
                        )}
                        <ModernButton 
                            onClick={() => navigate('/shipments')}
                            variant="secondary"
                            size="sm"
                            className="flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Back to Shipments</span>
                        </ModernButton>
                    </div>
                </div>
            </div>
        </Layout>
    );
}