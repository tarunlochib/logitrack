import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from '../components/Layout';
import ModernCard from "../components/ModernCard";
import ModernTable from "../components/ModernTable";
import StatusBadge from "../components/StatusBadge";

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
    const user = JSON.parse(localStorage.getItem("user"));
    const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get("http://localhost:5000/api/shipments", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: { page: 1, pageSize: 1000 } // fetch all for stats (or adjust as needed)
                });
                const allShipments = response.data.shipments || [];
                setShipments(allShipments.slice(0, 5)); // Show only recent 5 shipments
                // Calculate statistics
                const totalRevenue = allShipments.reduce((sum, shipment) => sum + Number(shipment.grandTotal), 0);
                const pendingPayments = allShipments.filter(s => s.paymentMethod === 'TO_PAY').length;
                const completedPayments = allShipments.filter(s => s.paymentMethod === 'PAID').length;
                setStats({
                    totalShipments: response.data.total || allShipments.length,
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

    // ICONS (inline SVGs for demo, replace with your own or Heroicons if desired)
    const icons = {
        shipments: (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        revenue: (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
        ),
        pending: (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        completed: (
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    // DRIVER DASHBOARD
    if (user && user.role === 'DRIVER') {
        const completedTrips = shipments.filter(s => s.status === 'DELIVERED' || s.status === 'COMPLETED').length;
        const activeTrips = shipments.filter(s => s.status !== 'DELIVERED' && s.status !== 'COMPLETED');
        const driverCards = [
            {
                icon: icons.completed,
                label: "Trips Completed",
                value: completedTrips,
                gradient: "from-blue-500 to-blue-300"
            },
            {
                icon: icons.pending,
                label: "Active Shipments",
                value: activeTrips.length,
                gradient: "from-green-500 to-green-300"
            }
        ];
        const driverTableColumns = [
            { label: "Bill No", key: "billNo" },
            { label: "Consignor", key: "consignorName" },
            { label: "Consignee", key: "consigneeName" },
            { label: "Date", key: "date" },
            { label: "Status", key: "status" },
            { label: "Payment Status", key: "paymentMethod" },
        ];
        return (
            <Layout>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-white min-h-screen">
                    <h2 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-tight">Driver Dashboard</h2>
                    <p className="text-gray-500 mb-8 text-lg">Welcome, {user.name}! Here you can view your assigned shipments and trip stats.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                        {driverCards.map((card, idx) => (
                            <ModernCard key={idx} {...card} />
                        ))}
                    </div>
                    <ModernTable
                        columns={driverTableColumns}
                        data={activeTrips.map(s => ({
                            ...s,
                            date: new Date(s.date).toLocaleDateString(),
                        }))}
                        headerGradient="from-blue-100 to-green-100"
                        renderCell={(row, col) => {
                            if (col.key === "status") return <StatusBadge status={row.status || "N/A"} />;
                            if (col.key === "paymentMethod") return <StatusBadge status={formatPaymentStatus(row.paymentMethod)} />;
                            return row[col.key];
                        }}
                        actions={null}
                        onRowClick={row => navigate(`/shipments/${row.id}`)}
                    />
                </div>
            </Layout>
        );
    }

    // ADMIN DASHBOARD
    const adminCards = [
        {
            icon: icons.shipments,
            label: "Total Shipments",
            value: stats.totalShipments,
            gradient: "from-blue-500 to-blue-300"
        },
        {
            icon: icons.revenue,
            label: "Total Revenue",
            value: currencyFormatter.format(stats.totalRevenue),
            gradient: "from-green-500 to-green-300"
        },
        {
            icon: icons.pending,
            label: "Pending Payments",
            value: stats.pendingPayments,
            gradient: "from-yellow-500 to-yellow-300"
        },
        {
            icon: icons.completed,
            label: "Completed Payments",
            value: stats.completedPayments,
            gradient: "from-purple-500 to-purple-300"
        },
    ];
    const adminTableColumns = [
        { label: "Bill No", key: "billNo", className: "text-sm px-4 py-3" },
        { label: "Consignor", key: "consignorName", className: "text-sm px-4 py-3" },
        { label: "Consignee", key: "consigneeName", className: "text-sm px-4 py-3" },
        { label: "Date", key: "date", className: "text-sm px-4 py-3" },
        { label: "Amount", key: "grandTotal", className: "text-green-700 font-bold text-sm px-4 py-3" },
        { label: "Status", key: "status", className: "text-sm px-4 py-3" },
        { label: "Payment Status", key: "paymentMethod", className: "text-sm px-4 py-3" },
    ];
    return (
        <Layout>
            <div className="px-2 sm:px-4 md:px-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
                <h2 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-tight">Dashboard Overview</h2>
                <p className="text-gray-500 mb-8 text-lg">Welcome to your admin dashboard. Here you can manage your shipments, vehicles, and drivers.</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {adminCards.map((card, idx) => (
                        <ModernCard key={idx} {...card} />
                    ))}
                </div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">Recent Shipments</h3>
                    <button onClick={() => navigate("/shipments")} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">View All →</button>
                </div>
                <div className="w-full overflow-x-auto rounded-xl bg-white">
                    <ModernTable
                        columns={adminTableColumns}
                        data={shipments.map(s => ({
                            ...s,
                            date: new Date(s.date).toLocaleDateString(),
                            grandTotal: currencyFormatter.format(s.grandTotal)
                        }))}
                        headerGradient="from-blue-100 to-green-100"
                        renderCell={(row, col) => {
                            if (col.key === "status") return <StatusBadge status={row.status || "N/A"} />;
                            if (col.key === "paymentMethod") return <StatusBadge status={formatPaymentStatus(row.paymentMethod)} />;
                            return row[col.key];
                        }}
                        actions={null}
                        onRowClick={row => navigate(`/shipments/${row.id}`)}
                    />
                </div>
            </div>
        </Layout>
    );
}