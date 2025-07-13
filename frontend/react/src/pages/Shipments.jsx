import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../api";
import Layout from '../components/Layout';
import ModernTable from "../components/ModernTable";
import StatusBadge from "../components/StatusBadge";
import ModernButton from "../components/ModernButton";
import SearchInput from "../components/SearchInput";
import Pagination from "../components/Pagination";
import ModernSelect from "../components/ModernSelect";
import ModernInput from "../components/ModernInput";
import ReactDOM from 'react-dom';
import toast from 'react-hot-toast';

// PortalDropdown component for rendering dropdown in a portal
function PortalDropdown({ anchorRef, open, onClose, children }) {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef();

    useEffect(() => {
        if (open && anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 4, // 4px gap
                left: rect.right + window.scrollX - 160, // align right edge, width 160px
                width: rect.width,
            });
        }
    }, [open, anchorRef]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                (!anchorRef.current || !anchorRef.current.contains(event.target))
            ) {
                onClose();
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open, onClose, anchorRef]);

    if (!open) return null;
    return ReactDOM.createPortal(
        <div
            ref={dropdownRef}
            className="z-50 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 flex flex-col animate-fade-in"
            style={{
                position: 'absolute',
                top: position.top,
                left: position.left,
                minWidth: 160,
            }}
        >
            {children}
        </div>,
        document.body
    );
}

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
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const [actionMenuOpen, setActionMenuOpen] = useState(null);
    const actionButtonRefs = useRef({});

    // Handle URL parameters for search
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchParam = urlParams.get('search');
        if (searchParam && searchParam !== search) {
            setSearch(searchParam);
            setPage(1); // Reset to first page when search changes
        }
    }, [location.search, search]);

    // Fetch drivers and vehicles for filter dropdowns
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [driversResponse, vehiclesResponse] = await Promise.all([
                    apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/with-user`),
                    apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles`),
                ]);
                const driversData = await driversResponse.json();
                const vehiclesData = await vehiclesResponse.json();
                setDrivers(Array.isArray(driversData) ? driversData : []);
                setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
            } catch (error) {
                setDrivers([]);
                setVehicles([]);
                console.error("Error fetching filter data:", error);
            }
        };
        fetchData();
    }, []);

    // Fetch shipments with filters
    const fetchShipments = async (pageArg = page, searchArg = search, filtersArg = filters) => {
        setLoading(true);
        try {
            const params = {
                page: pageArg,
                pageSize,
                search: searchArg,
                ...Object.fromEntries(Object.entries(filtersArg).filter(([_, v]) => v))
            };
            const url = new URL(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments`, window.location.origin);
            Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
            const response = await apiFetch(url.toString());
            const data = await response.json();
            setShipments(data.shipments);
            setTotal(data.total);
            setPage(data.page);
            setPageSize(data.pageSize);
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
            await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${shipmentId}`, {
                method: 'DELETE',
            });
            fetchShipments();
            toast.success("Shipment deleted successfully!");
        } catch (error) {
            console.error("Error deleting shipment:", error);
            toast.error("Failed to delete shipment. Please try again.");
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
    const driverOptions = (Array.isArray(drivers) ? drivers : []).map(driver => ({ value: driver.id, label: `${driver.user?.name || ''} (${driver.user?.phone || ''})` }));
    const vehicleOptions = (Array.isArray(vehicles) ? vehicles : []).map(vehicle => ({ value: vehicle.id, label: `${vehicle.number} - ${vehicle.model}` }));

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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                <div className="max-w-7xl mx-auto">
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
                                    <h1 className="text-3xl font-bold text-gray-900">Shipments</h1>
                                    <p className="text-gray-600 mt-1">Manage and track all your logistics shipments</p>
                                </div>
                            </div>
                            {user && user.role !== 'DRIVER' && (
                                <ModernButton 
                                    onClick={() => navigate("/shipments/new")}
                                    variant="primary"
                                    size="md"
                                    className="flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span>Add New Shipment</span>
                                </ModernButton>
                            )}
                        </div>
                    </div>

                    {/* Search and Filters Card */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-6 mb-8">
                        <div className="flex flex-col lg:flex-row items-center gap-4">
                            <div className="flex-1 w-full">
                                <SearchInput
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search shipments by bill number, consignor, consignee..."
                                    className="w-full"
                                />
                            </div>
                            <ModernButton
                                type="button"
                                variant={activeFilterCount ? "primary" : "secondary"}
                                size="sm"
                                onClick={() => setFiltersOpen(v => !v)}
                                className="flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                                </svg>
                                <span>Filters</span>
                                {activeFilterCount > 0 && (
                                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-white text-blue-600 rounded-full">{activeFilterCount}</span>
                                )}
                            </ModernButton>
                        </div>
                        
                        {filtersOpen && (
                            <div className="mt-6 p-6 bg-gray-50/80 rounded-2xl border border-gray-200/60">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                        placeholder="Source location"
                                        label="Source"
                                    />
                                    <ModernInput
                                        name="destination"
                                        value={filters.destination}
                                        onChange={handleFilterChange}
                                        placeholder="Destination location"
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
                                <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
                                    <ModernButton 
                                        type="button" 
                                        variant="secondary" 
                                        size="sm" 
                                        onClick={handleClearFilters} 
                                        className="flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Clear Filters</span>
                                    </ModernButton>
                                    <ModernButton 
                                        type="button" 
                                        variant="primary" 
                                        size="sm" 
                                        onClick={handleApplyFilters} 
                                        className="flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span>Apply Filters</span>
                                    </ModernButton>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Shipments Table Card */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-200/60 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">All Shipments</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {loading ? 'Loading...' : `${total} shipments found`}
                                </p>
                            </div>
                            {loading && (
                                <div className="flex items-center space-x-2 text-blue-600">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-sm">Loading shipments...</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200/60">
                                <thead className="bg-gray-50/80">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bill No</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Consignor</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Consignee</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white/50 divide-y divide-gray-200/60">
                                    {Array.isArray(shipments) && shipments.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12">
                                                <div className="flex flex-col items-center space-y-3">
                                                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                    <p className="text-gray-500 text-lg">No shipments found</p>
                                                    <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : Array.isArray(shipments) && shipments.map((shipment) => (
                                        <tr
                                            key={shipment.id}
                                            className="hover:bg-blue-50/60 cursor-pointer group transition-all duration-200"
                                            onClick={() => handleRowClick(shipment.id)}
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">#{shipment.billNo}</td>
                                            <td className="px-6 py-4 text-gray-800">{shipment.consignorName}</td>
                                            <td className="px-6 py-4 text-gray-800">{shipment.consigneeName}</td>
                                            <td className="px-6 py-4 text-gray-700">{new Date(shipment.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-green-700 font-bold text-lg">₹{shipment.grandTotal}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={shipment.status || "N/A"} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={formatPaymentMethod(shipment.paymentMethod)} />
                                            </td>
                                            <td className="px-4 py-4 text-center relative" onClick={e => e.stopPropagation()}>
                                                <button
                                                    ref={el => (actionButtonRefs.current[shipment.id] = el)}
                                                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
                                                    onClick={() => setActionMenuOpen(actionMenuOpen === shipment.id ? null : shipment.id)}
                                                    aria-label="Actions"
                                                >
                                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <circle cx="5" cy="12" r="2"/>
                                                        <circle cx="12" cy="12" r="2"/>
                                                        <circle cx="19" cy="12" r="2"/>
                                                    </svg>
                                                </button>
                                                <PortalDropdown
                                                    anchorRef={{ current: actionButtonRefs.current[shipment.id] }}
                                                    open={actionMenuOpen === shipment.id}
                                                    onClose={() => setActionMenuOpen(null)}
                                                >
                                                    <button
                                                        className="flex items-center gap-2 px-4 py-3 text-blue-700 hover:bg-blue-50 text-sm font-medium rounded-t-xl transition-colors"
                                                        onClick={() => { setActionMenuOpen(null); navigate(`/shipments/${shipment.id}`); }}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Details
                                                    </button>
                                                    {user && user.role !== 'DRIVER' && (
                                                        <button
                                                            className="flex items-center gap-2 px-4 py-3 text-yellow-700 hover:bg-yellow-50 text-sm font-medium transition-colors"
                                                            onClick={() => { setActionMenuOpen(null); navigate(`/shipments/${shipment.id}/edit`); }}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6M3 17v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                    )}
                                                    {user && user.role !== 'DRIVER' && (
                                                        <button
                                                            className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 text-sm font-medium rounded-b-xl transition-colors"
                                                            onClick={e => { setActionMenuOpen(null); handleDelete(e, shipment.id); }}
                                                            disabled={deleting[shipment.id]}
                                                        >
                                                            {deleting[shipment.id] ? (
                                                                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            )}
                                                            {deleting[shipment.id] ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    )}
                                                </PortalDropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="px-8 py-6 border-t border-gray-200/60">
                            <Pagination
                                page={page}
                                pageSize={pageSize}
                                total={total}
                                onPageChange={setPage}
                                onPageSizeChange={setPageSize}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}