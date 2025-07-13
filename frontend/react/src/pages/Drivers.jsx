import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import Layout from "../components/Layout";
import ModernTable from "../components/ModernTable";
import StatusBadge from "../components/StatusBadge";
import ModernButton from "../components/ModernButton";
import SearchInput from "../components/SearchInput";
import ReactDOM from 'react-dom';
import { FaUser, FaPhone, FaIdCard, FaTruck, FaPlus, FaSearch, FaEllipsisV, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import toast from 'react-hot-toast';

// PortalDropdown for actions menu
function PortalDropdown({ anchorRef, open, onClose, children }) {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const dropdownRef = useRef();

    useEffect(() => {
        if (open && anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 160,
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

export default function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const navigate = useNavigate();
    const [actionMenuOpen, setActionMenuOpen] = useState(null);
    const actionButtonRefs = useRef({});

    const fetchDrivers = async () => {
        try {
            const response = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers`);
            const data = await response.json();
            setDrivers(data);
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
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this driver?")) {
            try {
                await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/${driverId}`, {
                    method: 'DELETE',
                });
                toast.success("Driver deleted successfully");
                fetchDrivers();
            } catch (error) {
                console.error("Error deleting driver:", error);
                toast.error("Failed to delete driver. Please try again.");
            }
        }
    };

    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch = driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            driver.phone?.includes(searchTerm) ||
                            driver.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = filterStatus === "all" || 
                            (filterStatus === "assigned" && driver.vehicle) ||
                            (filterStatus === "unassigned" && !driver.vehicle);
        
        return matchesSearch && matchesStatus;
    });

    const getDriverStats = () => {
        const total = drivers.length;
        const assigned = drivers.filter(d => d.vehicle).length;
        const unassigned = total - assigned;
        return { total, assigned, unassigned };
    };

    const stats = getDriverStats();

    return (
        <Layout>
            <div className="px-2 sm:px-4 md:px-6 py-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
                            <p className="text-gray-600">Manage and track your driver fleet</p>
                        </div>
                        <ModernButton 
                            onClick={() => navigate("/drivers/new")}
                            variant="primary"
                            className="flex items-center text-sm px-4 py-2"
                        >
                            <FaPlus className="mr-2" />
                            Add New Driver
                        </ModernButton>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FaUser className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FaTruck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Assigned</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <FaUser className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Unassigned</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.unassigned}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <SearchInput
                                placeholder="Search drivers by name, phone, or license..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Drivers</option>
                                <option value="assigned">Assigned</option>
                                <option value="unassigned">Unassigned</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading drivers...</p>
                        </div>
                    </div>
                ) : filteredDrivers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
                            <div className="text-gray-400 text-6xl mb-4">👨‍💼</div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Drivers Found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchTerm || filterStatus !== "all" 
                                    ? "Try adjusting your search or filter criteria."
                                    : "Get started by adding your first driver."
                                }
                            </p>
                            <ModernButton 
                                onClick={() => navigate("/drivers/new")}
                                variant="primary"
                                className="w-full text-sm px-4 py-2"
                            >
                                <FaPlus className="mr-2" />
                                Add Your First Driver
                            </ModernButton>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">All Drivers</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">License</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredDrivers.map((driver) => (
                                        <tr
                                            key={driver.id}
                                            className="hover:bg-blue-50/60 cursor-pointer group transition"
                                            onClick={() => handleRowClick(driver.id)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <FaUser className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{driver.name}</p>
                                                        <p className="text-sm text-gray-500">ID: {driver.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <FaPhone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-900">{driver.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <FaIdCard className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-900 font-mono text-sm">{driver.licenseNumber}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {driver.vehicle ? (
                                                    <div className="flex items-center space-x-2">
                                                        <FaTruck className="w-4 h-4 text-green-500" />
                                                        <span className="text-gray-900">{driver.vehicle.number}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">No vehicle assigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge 
                                                    status={driver.vehicle ? 'Assigned' : 'Unassigned'} 
                                                    type={driver.vehicle ? 'completed' : 'pending'} 
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center relative" onClick={e => e.stopPropagation()}>
                                                <button
                                                    ref={el => (actionButtonRefs.current[driver.id] = el)}
                                                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                                                    onClick={() => setActionMenuOpen(actionMenuOpen === driver.id ? null : driver.id)}
                                                    aria-label="Actions"
                                                >
                                                    <FaEllipsisV className="w-4 h-4 text-gray-500" />
                                                </button>
                                                <PortalDropdown
                                                    anchorRef={{ current: actionButtonRefs.current[driver.id] }}
                                                    open={actionMenuOpen === driver.id}
                                                    onClose={() => setActionMenuOpen(null)}
                                                >
                                                    <button
                                                        className="flex items-center gap-2 px-4 py-2 text-cyan-700 hover:bg-cyan-50 text-sm font-medium rounded-t-xl"
                                                        onClick={() => { setActionMenuOpen(null); navigate(`/drivers/${driver.id}`); }}
                                                    >
                                                        <FaEye className="w-4 h-4" />
                                                        View Details
                                                    </button>
                                                    <button
                                                        className="flex items-center gap-2 px-4 py-2 text-yellow-700 hover:bg-yellow-50 text-sm font-medium"
                                                        onClick={() => { setActionMenuOpen(null); navigate(`/drivers/${driver.id}/edit`); }}
                                                    >
                                                        <FaEdit className="w-4 h-4" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium rounded-b-xl"
                                                        onClick={e => { setActionMenuOpen(null); handleDelete(e, driver.id); }}
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </PortalDropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}