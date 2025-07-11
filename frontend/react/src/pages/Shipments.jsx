import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from '../components/Layout';
import ModernTable from "../components/ModernTable";
import StatusBadge from "../components/StatusBadge";
import ModernButton from "../components/ModernButton";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import ModernSelect from "../components/ModernSelect";
import ModernInput from "../components/ModernInput";
import { useRef } from "react";

export default function Shipments() {
    const [shipments, setShipments] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState({});
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [filters, setFilters] = useState({
        status: "",
        paymentMethod: "",
        fromDate: "",
        toDate: "",
        driverId: "",
        vehicleId: "",
        source: "",
        destination: ""
    });
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const filtersRef = useRef();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // Fetch drivers and vehicles for filter dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };
                const [driversResponse, vehiclesResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/drivers/with-user`, { headers }),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/vehicles`, { headers }),
                ]);
                setDrivers(driversResponse.data);
                setVehicles(vehiclesResponse.data);
            } catch (error) {
                console.error("Error fetching filter data:", error);
            }
        };
        fetchData();
    }, []);

    // Fetch shipments with filters
    const fetchShipments = async (pageArg = page, searchArg = search, filtersArg = filters) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const params = {
                page: pageArg,
                pageSize,
                search: searchArg,
                ...Object.fromEntries(Object.entries(filtersArg).filter(([_, v]) => v))
            };
            console.log("Shipments API params:", params); // Debug log
            const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setShipments(response.data.shipments);
            setTotal(response.data.total);
            setPage(response.data.page);
            setPageSize(response.data.pageSize);
        } catch (error) {
            setShipments([]);
            setTotal(0);
            console.error("Error fetching shipments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipments(page, search, filters);
        // eslint-disable-next-line
    }, [page, pageSize, search, filters]);

    const handleRowClick = (shipmentId) => {
        navigate(`/shipments/${shipmentId}`);
    };

    const handleDelete = async (e, shipmentId) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this shipment? This action cannot be undone.")) {
            return;
        }
        setDeleting(prev => ({ ...prev, [shipmentId]: true }));
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${shipmentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchShipments();
        } catch (error) {
            console.error("Error deleting shipment:", error);
            alert("Failed to delete shipment. Please try again.");
        } finally {
            setDeleting(prev => ({ ...prev, [shipmentId]: false }));
        }
    };

    // Filter UI logic
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1); // Reset to first page on filter change
    };
    const handleSelectChange = (name, value) => {
        console.log("Filter changed:", name, value); // Debug log
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };
    const handleClearFilters = () => {
        setFilters({
            status: "",
            paymentMethod: "",
            fromDate: "",
            toDate: "",
            driverId: "",
            vehicleId: "",
            source: "",
            destination: ""
        });
        setPage(1);
    };
    const handleApplyFilters = () => {
        setFilters({ ...filters });
        setFiltersOpen(false);
    };

    // Filter options (match backend exactly)
    const statusOptions = [
        { value: "PENDING", label: "Pending" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "COMPLETED", label: "Completed" },
        { value: "DELIVERED", label: "Delivered" },
    ];
    const paymentMethodOptions = [
        { value: "TO_PAY", label: "To Pay" },
        { value: "PAID", label: "Paid" },
        { value: "TO_BE_BILLED", label: "To Be Billed" },
    ];
    const driverOptions = drivers.map(driver => ({ value: driver.id, label: `${driver.user?.name || ''} (${driver.user?.phone || ''})` }));
    const vehicleOptions = vehicles.map(vehicle => ({ value: vehicle.id, label: `${vehicle.number} - ${vehicle.model}` }));

    // Count active filters
    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    function formatPaymentMethod(method) {
        if (!method) return '';
        return method
            .toLowerCase()
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const statusColors = {
        PENDING: 'bg-blue-100 text-blue-800',
        IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
        COMPLETED: 'bg-green-100 text-green-800',
        DELIVERED: 'bg-purple-100 text-purple-800',
    };

    return (
        <Layout>
            <div className="flex flex-col gap-4 px-2 sm:px-4 md:px-6">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <SearchInput
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search shipments..."
                        className="w-full md:w-64"
                    />
                    <ModernButton
                        type="button"
                        variant={activeFilterCount ? "primary" : "secondary"}
                        size="md"
                        onClick={() => setFiltersOpen(v => !v)}
                        className="ml-2 flex items-center gap-2"
                    >
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-blue-500 text-white rounded-full">{activeFilterCount}</span>
                        )}
                    </ModernButton>
                    {user && user.role !== 'DRIVER' && (
                        <ModernButton 
                            onClick={() => navigate("/shipments/new")}
                            variant="primary"
                            className="ml-auto"
                        >
                            + Add New Shipment
                        </ModernButton>
                    )}
                </div>
                {filtersOpen && (
                    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex flex-col gap-4 animate-fade-in mb-2">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <ModernSelect
                                name="status"
                                value={filters.status}
                                onChange={e => handleSelectChange("status", e.target.value)}
                                options={[{ value: "", label: "All Statuses" }, ...statusOptions]}
                                placeholder="Status"
                                label="Status"
                            />
                            <ModernSelect
                                name="paymentMethod"
                                value={filters.paymentMethod}
                                onChange={e => handleSelectChange("paymentMethod", e.target.value)}
                                options={[{ value: "", label: "All Payment Methods" }, ...paymentMethodOptions]}
                                placeholder="Payment Method"
                                label="Payment Method"
                            />
                            <ModernSelect
                                name="driverId"
                                value={filters.driverId}
                                onChange={e => handleSelectChange("driverId", e.target.value)}
                                options={[{ value: "", label: "All Drivers" }, ...driverOptions]}
                                placeholder="Driver"
                                label="Driver"
                            />
                            <ModernSelect
                                name="vehicleId"
                                value={filters.vehicleId}
                                onChange={e => handleSelectChange("vehicleId", e.target.value)}
                                options={[{ value: "", label: "All Vehicles" }, ...vehicleOptions]}
                                placeholder="Vehicle"
                                label="Vehicle"
                            />
                            <ModernInput
                                name="source"
                                value={filters.source}
                                onChange={handleFilterChange}
                                placeholder="Source"
                                label="Source"
                            />
                            <ModernInput
                                name="destination"
                                value={filters.destination}
                                onChange={handleFilterChange}
                                placeholder="Destination"
                                label="Destination"
                            />
                            <ModernInput
                                name="fromDate"
                                type="date"
                                value={filters.fromDate}
                                onChange={handleFilterChange}
                                label="From Date"
                            />
                            <ModernInput
                                name="toDate"
                                type="date"
                                value={filters.toDate}
                                onChange={handleFilterChange}
                                label="To Date"
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-2 justify-end mt-2 w-full">
                            <ModernButton type="button" variant="secondary" size="sm" onClick={handleClearFilters} className="w-full md:w-32 flex items-center justify-center">Clear Filters</ModernButton>
                            <ModernButton type="button" variant="primary" size="sm" onClick={handleApplyFilters} className="w-full md:w-32 flex items-center justify-center">Apply</ModernButton>
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Loading shipments...</span>
                    </div>
                ) : shipments.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500 text-lg">No shipments found</p>
                        {user && user.role !== 'DRIVER' && (
                            <ModernButton 
                                onClick={() => navigate("/shipments/new")}
                                variant="primary"
                                className="mt-4"
                            >
                                Create Your First Shipment
                            </ModernButton>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="w-full overflow-x-auto rounded-xl bg-white">
                            <ModernTable
                                columns={[
                                    { label: "Bill No", key: "billNo", className: "text-xs px-2 py-2 truncate max-w-[120px]" },
                                    { label: "Consignor", key: "consignorName", className: "text-xs px-2 py-2 truncate max-w-[120px]" },
                                    { label: "Consignee", key: "consigneeName", className: "text-xs px-2 py-2 truncate max-w-[120px]" },
                                    { label: "Date", key: "date", className: "text-xs px-2 py-2" },
                                    { label: "Total", key: "grandTotal", className: "text-xs px-2 py-2" },
                                    { label: "Payment Status", key: "paymentMethod", className: "text-xs px-2 py-2" },
                                    { label: "Status", key: "status", className: "text-xs px-2 py-2" },
                                ]}
                                data={shipments}
                                renderCell={(row, col) => {
                                    if (col.key === "billNo") {
                                        return <span className="font-medium text-gray-900 truncate">{row.billNo}</span>;
                                    }
                                    if (col.key === "consignorName") {
                                        return <div>
                                            <div className="text-sm text-gray-900 truncate">{row.consignorName}</div>
                                            <div className="text-xs text-gray-500 truncate">{row.source}</div>
                                        </div>;
                                    }
                                    if (col.key === "consigneeName") {
                                        return <div>
                                            <div className="text-sm text-gray-900 truncate">{row.consigneeName}</div>
                                            <div className="text-xs text-gray-500 truncate">{row.destination}</div>
                                        </div>;
                                    }
                                    if (col.key === "date") {
                                        return <span>{new Date(row.date).toLocaleDateString()}</span>;
                                    }
                                    if (col.key === "grandTotal") {
                                        return <span className="font-semibold text-green-600">₹{row.grandTotal}</span>;
                                    }
                                    if (col.key === "paymentMethod") {
                                        return <StatusBadge status={formatPaymentMethod(row.paymentMethod)} type={row.paymentMethod?.toLowerCase()} />;
                                    }
                                    if (col.key === "status") {
                                        return <StatusBadge status={row.status ? row.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'} type={row.status?.toLowerCase()} />;
                                    }
                                    return row[col.key];
                                }}
                                actions={(row) => (
                                    <div className="flex items-center gap-2 justify-center">
                                        <ModernButton
                                            onClick={e => { e.stopPropagation(); navigate(`/shipments/${row.id}/edit`); }}
                                            size="sm"
                                            variant="secondary"
                                            className="text-xs px-2 py-1"
                                        >
                                            Edit
                                        </ModernButton>
                                        <ModernButton
                                            onClick={e => handleDelete(e, row.id)}
                                            size="sm"
                                            variant="danger"
                                            loading={deleting[row.id]}
                                            className="text-xs px-2 py-1"
                                        >
                                            Delete
                                        </ModernButton>
                                    </div>
                                )}
                                onRowClick={row => handleRowClick(row.id)}
                            />
                        </div>
                        <Pagination
                            page={page}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={p => setPage(p)}
                        />
                    </>
                )}
            </div>
        </Layout>
    );
}