import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Layout from '../components/Layout';
import ModernCard from "../components/ModernCard";
import ModernTable from "../components/ModernTable";
import StatusBadge from "../components/StatusBadge";
import ModernButton from "../components/ModernButton";
import { apiFetch } from "../api";
import { FaBoxOpen, FaMoneyBillWave, FaClock, FaCheckCircle, FaEllipsisV, FaEdit, FaTrash, FaEye, FaTruck, FaUser, FaChartLine } from 'react-icons/fa';

export default function Dashboard() {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalShipments: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        completedPayments: 0
    });
    const navigate = useNavigate();
    
    // Safe parsing of user data from localStorage
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    
    const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await apiFetch(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments?page=1&pageSize=1000`
                );
                const data = await response.json();
                const allShipments = data.shipments || [];
                setShipments(allShipments.slice(0, 5)); // Show only recent 5 shipments
                // Calculate statistics
                const totalRevenue = allShipments.reduce((sum, shipment) => sum + Number(shipment.grandTotal), 0);
                const pendingPayments = allShipments.filter(s => s.paymentMethod === 'TO_PAY').length;
                const completedPayments = allShipments.filter(s => s.paymentMethod === 'PAID').length;
                setStats({
                    totalShipments: data.total || allShipments.length,
                    totalRevenue,
                    pendingPayments,
                    completedPayments
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    function formatPaymentStatus(status) {
        if (!status) return '';
        if (status === 'TO_BE_BILLED') return 'To be billed';
        if (status === 'TO_PAY') return 'To pay';
        if (status === 'PAID') return 'Paid';
        return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }

    // Utility to format numbers in Indian style (K, L, Cr)
    function formatIndianAmount(amount) {
        if (amount < 1000) return `₹${amount}`;
        if (amount < 100000) return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
        if (amount < 10000000) return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
        return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 2)}Cr`;
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // If no user data, redirect to login
    if (!user) {
        window.location.href = '/login';
        return null;
    }

    // DRIVER DASHBOARD
    if (user.role === 'DRIVER') {
        const completedTrips = shipments.filter(s => s.status === 'DELIVERED' || s.status === 'COMPLETED').length;
        const activeTrips = shipments.filter(s => s.status !== 'DELIVERED' && s.status !== 'COMPLETED');
        const driverCards = [
            {
                icon: <FaCheckCircle className="w-8 h-8 text-white" />,
                label: "Trips Completed",
                value: completedTrips,
                gradient: "from-blue-500 to-blue-400",
                to: "/shipments?status=completed"
            },
            {
                icon: <FaClock className="w-8 h-8 text-white" />,
                label: "Active Shipments",
                value: activeTrips.length,
                gradient: "from-green-500 to-green-400",
                to: "/shipments?status=active"
            }
        ];
        
        return (
            <Layout>
                <div className="px-2 sm:px-4 md:px-6 py-6">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
                                <p className="text-gray-600">Welcome, {user.name}! Track your shipments and view trip statistics.</p>
                            </div>
                            <ModernButton 
                                onClick={() => navigate("/shipments")}
                                variant="primary"
                                className="flex items-center text-sm"
                            >
                                <FaTruck className="mr-2" />
                                View All Shipments
                            </ModernButton>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {driverCards.map((card, idx) => (
                            <Link
                                to={card.to}
                                key={card.label}
                                className={`group block rounded-2xl shadow-lg transition-transform transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 border border-gray-100 bg-gradient-to-br ${card.gradient} relative overflow-hidden min-h-[140px]`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="absolute right-4 top-4 opacity-30 group-hover:opacity-50 transition-opacity">
                                    {card.icon}
                                </div>
                                <div className="flex flex-col justify-between h-full p-6 relative z-10 min-w-0">
                                    <div className="text-3xl md:text-4xl font-extrabold text-white drop-shadow mb-2 truncate" style={{lineHeight: '1.1'}}>{card.value}</div>
                                    <div className="text-lg font-semibold text-white/90 drop-shadow mb-1 truncate">{card.label}</div>
                                    <div className="text-xs text-white/70 group-hover:text-white/90 transition-colors">View details →</div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Recent Shipments Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Active Shipments</h2>
                                <button 
                                    onClick={() => navigate("/shipments")} 
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                >
                                    View All →
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill No</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consignor</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consignee</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {activeTrips.length === 0 ? (
                                        <tr><td colSpan={6} className="text-center py-8 text-gray-400">No active shipments found.</td></tr>
                                    ) : activeTrips.map((shipment) => (
                                        <tr
                                            key={shipment.id}
                                            className="hover:bg-blue-50/60 cursor-pointer group transition"
                                            onClick={() => navigate(`/shipments/${shipment.id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{shipment.billNo}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">{shipment.consignorName}</td>
                                            <td className="px-6 py-4 text-gray-900">{shipment.consigneeName}</td>
                                            <td className="px-6 py-4 text-gray-900">{new Date(shipment.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={shipment.status || "N/A"} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={formatPaymentStatus(shipment.paymentMethod)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // DISPATCHER DASHBOARD
    if (user.role === 'DISPATCHER') {
        const pendingShipments = shipments.filter(s => s.status === 'PENDING' || s.status === 'IN_TRANSIT').length;
        const completedShipments = shipments.filter(s => s.status === 'DELIVERED' || s.status === 'COMPLETED').length;
        const dispatcherCards = [
            {
                icon: <FaBoxOpen className="w-8 h-8 text-white" />,
                label: "Total Shipments",
                value: stats.totalShipments,
                gradient: "from-blue-500 to-blue-400",
                to: "/shipments"
            },
            {
                icon: <FaClock className="w-8 h-8 text-white" />,
                label: "Pending Shipments",
                value: pendingShipments,
                gradient: "from-yellow-500 to-yellow-400",
                to: "/shipments?status=pending"
            },
            {
                icon: <FaCheckCircle className="w-8 h-8 text-white" />,
                label: "Completed Shipments",
                value: completedShipments,
                gradient: "from-green-500 to-green-400",
                to: "/shipments?status=completed"
            },
            {
                icon: <FaMoneyBillWave className="w-8 h-8 text-white" />,
                label: "Total Revenue",
                value: formatIndianAmount(stats.totalRevenue),
                gradient: "from-purple-500 to-purple-400",
                to: "/analytics"
            },
        ];
        
        return (
            <Layout>
                <div className="px-2 sm:px-4 md:px-6 py-6">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Dispatcher Dashboard</h1>
                                <p className="text-gray-600">Welcome, {user.name}! Manage shipments, drivers, and vehicles.</p>
                            </div>
                            <ModernButton 
                                onClick={() => navigate("/shipments/new")}
                                variant="primary"
                                className="flex items-center text-sm"
                            >
                                <FaBoxOpen className="mr-2" />
                                Add Shipment
                            </ModernButton>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {dispatcherCards.map((card, idx) => (
                            <Link
                                to={card.to}
                                key={card.label}
                                className={`group block rounded-2xl shadow-lg transition-transform transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 border border-gray-100 bg-gradient-to-br ${card.gradient} relative overflow-hidden min-h-[140px]`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div className="absolute right-4 top-4 opacity-30 group-hover:opacity-50 transition-opacity">
                                    {card.icon}
                                </div>
                                <div className="flex flex-col justify-between h-full p-6 relative z-10 min-w-0">
                                    <div className="text-3xl md:text-4xl font-extrabold text-white drop-shadow mb-2 truncate" style={{lineHeight: '1.1'}}>{card.value}</div>
                                    <div className="text-lg font-semibold text-white/90 drop-shadow mb-1 truncate">{card.label}</div>
                                    <div className="text-xs text-white/70 group-hover:text-white/90 transition-colors">View details →</div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Recent Shipments Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
                                <button 
                                    onClick={() => navigate("/shipments")} 
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                >
                                    View All →
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill No</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consignor</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consignee</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {shipments.length === 0 ? (
                                        <tr><td colSpan={7} className="text-center py-8 text-gray-400">No shipments found.</td></tr>
                                    ) : shipments.map((shipment) => (
                                        <tr
                                            key={shipment.id}
                                            className="hover:bg-blue-50/60 cursor-pointer group transition"
                                            onClick={() => navigate(`/shipments/${shipment.id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{shipment.billNo}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">{shipment.consignorName}</td>
                                            <td className="px-6 py-4 text-gray-900">{shipment.consigneeName}</td>
                                            <td className="px-6 py-4 text-gray-900">{new Date(shipment.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-green-700 font-bold">
                                                {currencyFormatter.format(shipment.grandTotal)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={shipment.status || "N/A"} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={formatPaymentStatus(shipment.paymentMethod)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // ADMIN DASHBOARD
    const adminCards = [
        {
            icon: <FaBoxOpen className="w-8 h-8 text-white" />,
            label: "Total Shipments",
            value: stats.totalShipments,
            gradient: "from-blue-500 to-blue-400",
            to: "/shipments"
        },
        {
            icon: <FaMoneyBillWave className="w-8 h-8 text-white" />,
            label: "Total Revenue",
            value: formatIndianAmount(stats.totalRevenue),
            gradient: "from-green-500 to-green-400",
            to: "/analytics"
        },
        {
            icon: <FaClock className="w-8 h-8 text-white" />,
            label: "Pending Payments",
            value: stats.pendingPayments,
            gradient: "from-yellow-500 to-yellow-400",
            to: "/shipments?payment=pending"
        },
        {
            icon: <FaCheckCircle className="w-8 h-8 text-white" />,
            label: "Completed Payments",
            value: stats.completedPayments,
            gradient: "from-purple-500 to-purple-400",
            to: "/shipments?payment=completed"
        },
    ];
    
    return (
        <Layout>
            <div className="px-2 sm:px-4 md:px-6 py-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Heading and subheading stacked vertically */}
                        <div className="flex flex-col items-start gap-1 flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                            <p className="text-gray-600">
                                Welcome to your admin dashboard.<br />
                                Manage shipments, vehicles, and drivers.
                            </p>
                        </div>
                        {/* Buttons aligned right, with margin on small screens */}
                        <div className="flex gap-3 mt-2 sm:mt-0">
                            <ModernButton 
                                onClick={() => navigate("/shipments/new")}
                                variant="primary"
                                className="flex items-center text-sm"
                            >
                                <FaBoxOpen className="mr-2" />
                                Add Shipment
                            </ModernButton>
                            <ModernButton 
                                onClick={() => navigate("/profit-loss")}
                                variant="secondary"
                                className="flex items-center text-sm"
                            >
                                <FaChartLine className="mr-2" />
                                P&L Statement
                            </ModernButton>
                            <ModernButton 
                                onClick={() => navigate("/analytics")}
                                variant="secondary"
                                className="flex items-center text-sm"
                            >
                                <FaChartLine className="mr-2" />
                                View Analytics
                            </ModernButton>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {adminCards.map((card, idx) => (
                        <Link
                            to={card.to}
                            key={card.label}
                            className={`group block rounded-2xl shadow-lg transition-transform transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 border border-gray-100 bg-gradient-to-br ${card.gradient} relative overflow-hidden min-h-[140px]`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="absolute right-4 top-4 opacity-30 group-hover:opacity-50 transition-opacity">
                                {card.icon}
                            </div>
                            <div className="flex flex-col justify-between h-full p-6 relative z-10 min-w-0">
                                <div className="text-3xl md:text-4xl font-extrabold text-white drop-shadow mb-2 truncate" style={{lineHeight: '1.1'}}>{card.value}</div>
                                <div className="text-lg font-semibold text-white/90 drop-shadow mb-1 truncate">{card.label}</div>
                                <div className="text-xs text-white/70 group-hover:text-white/90 transition-colors">View details →</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Shipments Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
                            <button 
                                onClick={() => navigate("/shipments")} 
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                            >
                                View All →
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bill No</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consignor</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Consignee</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {shipments.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">No shipments found.</td></tr>
                                ) : shipments.map((shipment) => (
                                    <tr
                                        key={shipment.id}
                                        className="hover:bg-blue-50/60 cursor-pointer group transition"
                                        onClick={() => navigate(`/shipments/${shipment.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{shipment.billNo}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">{shipment.consignorName}</td>
                                        <td className="px-6 py-4 text-gray-900">{shipment.consigneeName}</td>
                                        <td className="px-6 py-4 text-gray-900">{new Date(shipment.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-green-700 font-bold">
                                            {currencyFormatter.format(shipment.grandTotal)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={shipment.status || "N/A"} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={formatPaymentStatus(shipment.paymentMethod)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}