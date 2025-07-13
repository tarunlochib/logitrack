import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ModernContentCard from '../components/ModernContentCard';
import ModernButton from '../components/ModernButton';
import ModernModal from '../components/ModernModal';
import ModernInput from '../components/ModernInput';
import ModernSelect from '../components/ModernSelect';
import { api } from '../api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { FaBuilding, FaUserFriends, FaUsers, FaBoxOpen, FaEllipsisV, FaEdit, FaTrash, FaPowerOff, FaEye } from 'react-icons/fa';
import ReactDOM from 'react-dom';

// PortalDropdown component for rendering dropdown in a portal
function PortalDropdown({ anchorRef, open, onClose, children }) {
  const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = React.useRef();

  React.useEffect(() => {
    if (open && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4, // 4px gap
        left: rect.right + window.scrollX - 160, // align right edge, width 160px
        width: rect.width,
      });
    }
  }, [open, anchorRef]);

  React.useEffect(() => {
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

const SuperadminDashboard = () => {
    const navigate = useNavigate();
    const [transporters, setTransporters] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        transporterName: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        gstNumber: '',
        phone: '',
        address: '',
        domain: ''
    });
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editTransporter, setEditTransporter] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', domain: '', isActive: true });
    const [editError, setEditError] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteTransporter, setDeleteTransporter] = useState(null);
    const [deleteError, setDeleteError] = useState("");
    const [analytics, setAnalytics] = useState(null);
    const [actionMenuOpen, setActionMenuOpen] = React.useState(null);
    const actionButtonRefs = React.useRef({});

    useEffect(() => {
        fetchData();
        fetchAnalytics();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError("");
        try {
            const [transportersRes, statsRes] = await Promise.all([
                api.get('/superadmin/transporters'),
                api.get('/superadmin/dashboard-stats')
            ]);
            setTransporters(Array.isArray(transportersRes) ? transportersRes : []);
            setStats(statsRes || {});
        } catch (error) {
            setError(error.message || 'Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/superadmin/analytics/overview');
            setAnalytics(res.data || res);
        } catch (err) {
            // Optionally handle error
        }
    };

    const handleCreateTransporter = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await api.post('/superadmin/create-transporter', createForm);
            setShowCreateModal(false);
            setCreateForm({
                transporterName: '',
                adminName: '',
                adminEmail: '',
                adminPassword: '',
                gstNumber: '',
                phone: '',
                address: '',
                domain: ''
            });
            fetchData();
        } catch (error) {
            setError(error.message || 'Error creating transporter');
        }
    };

    const handleStatusToggle = async (transporterId, currentStatus) => {
        setError("");
        try {
            await api.patch(`/superadmin/transporters/${transporterId}/status`, {
                isActive: !currentStatus
            });
            fetchData();
        } catch (error) {
            setError(error.message || 'Error updating status');
        }
    };

    // Open edit modal and prefill form
    const handleEditClick = (transporter) => {
        setEditTransporter(transporter);
        setEditForm({
            name: transporter.name || '',
            domain: transporter.domain || '',
            isActive: transporter.isActive
        });
        setEditError("");
        setEditModalOpen(true);
    };

    // Handle edit form change
    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle edit form submit (API call will be implemented after backend endpoint)
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditError("");
        try {
            await api.patch(`/superadmin/transporters/${editTransporter.id}`, editForm);
            setEditModalOpen(false);
            fetchData();
        } catch (err) {
            setEditError(err.message || 'Error updating transporter');
        }
    };

    const handleDeleteClick = (transporter) => {
        setDeleteTransporter(transporter);
        setDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setDeleteError("");
        try {
            await api.delete(`/superadmin/transporters/${deleteTransporter.id}`);
            setDeleteModalOpen(false);
            fetchData();
        } catch (err) {
            setDeleteError(err.message || 'Error deleting transporter');
        }
    };

    // Stat cards config
    const statCards = [
        {
            label: 'Total Transporters',
            value: stats.totalTransporters || 0,
            icon: <FaBuilding className="w-8 h-8 text-white" />,
            gradient: 'from-blue-500 to-blue-400',
            to: '/superadmin/transporters',
        },
        {
            label: 'Active Transporters',
            value: stats.activeTransporters || 0,
            icon: <FaUserFriends className="w-8 h-8 text-white" />,
            gradient: 'from-green-500 to-green-400',
            to: '/superadmin/transporters?status=active',
        },
        {
            label: 'Total Users',
            value: stats.totalUsers || 0,
            icon: <FaUsers className="w-8 h-8 text-white" />,
            gradient: 'from-purple-500 to-purple-400',
            to: '/superadmin/users',
        },
        {
            label: 'Total Shipments',
            value: stats.totalShipments || 0,
            icon: <FaBoxOpen className="w-8 h-8 text-white" />,
            gradient: 'from-orange-500 to-orange-400',
            to: '/superadmin/analytics',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded shadow text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <ModernButton onClick={fetchData} className="bg-blue-600 hover:bg-blue-700">Retry</ModernButton>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Elegant Header */}
                <div className="bg-white rounded-2xl shadow border border-gray-100 px-6 py-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Superadmin Dashboard</h1>
                        <p className="text-gray-500 text-base font-medium">Manage all transporters and get a complete system overview.</p>
                    </div>
                    <ModernButton
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow px-6 py-3 text-base"
                    >
                        + Create Transporter
                    </ModernButton>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((card, idx) => (
                        <Link
                            to={card.to}
                            key={card.label}
                            className={`group block rounded-2xl shadow-lg transition-transform transform hover:scale-[1.04] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 border border-gray-100 bg-gradient-to-br ${card.gradient} relative overflow-hidden min-h-[140px]`}
                            style={{ textDecoration: 'none' }}
                        >
                            <div className="absolute right-4 top-4 opacity-30 group-hover:opacity-50 transition-opacity">
                                {card.icon}
                            </div>
                            <div className="flex flex-col justify-between h-full p-6 relative z-10">
                                <div className="text-4xl font-extrabold text-white drop-shadow mb-2">{card.value}</div>
                                <div className="text-lg font-semibold text-white/90 drop-shadow mb-1">{card.label}</div>
                                <div className="text-xs text-white/70 group-hover:text-white/90 transition-colors">View details →</div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Transporters List */}
                <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">All Transporters</h2>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Transporter
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Users
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Vehicles
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Drivers
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Shipments
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {(Array.isArray(transporters) ? transporters : []).length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No transporters found.</td></tr>
                            ) : (Array.isArray(transporters) ? transporters : []).map((transporter) => (
                                <tr
                                    key={transporter.id}
                                    className="hover:bg-blue-50/60 cursor-pointer group transition"
                                    onClick={() => navigate(`/superadmin/transporters/${transporter.id}`)}
                                >
                                    <td className="px-4 py-2">
                                        <div>
                                            <div className="font-medium text-gray-900 max-w-[180px] truncate" title={transporter.name}>
                                                {transporter.name}
                                            </div>
                                            <div className="text-sm text-gray-500 max-w-[180px] truncate" title={transporter.slug}>
                                                {transporter.slug}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-gray-900">
                                        {transporter._count?.users ?? 0}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900">
                                        {transporter._count?.vehicles ?? 0}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900">
                                        {transporter._count?.drivers ?? 0}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900">
                                        {transporter._count?.shipments ?? 0}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                            transporter.isActive 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-gray-200 text-gray-500'
                                        }`}>
                                            {transporter.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 text-center relative" onClick={e => e.stopPropagation()}>
                                        <button
                                            ref={el => (actionButtonRefs.current[transporter.id] = el)}
                                            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                                            onClick={() => setActionMenuOpen(actionMenuOpen === transporter.id ? null : transporter.id)}
                                            aria-label="Actions"
                                        >
                                            <FaEllipsisV className="text-gray-500" />
                                        </button>
                                        <PortalDropdown
                                            anchorRef={{ current: actionButtonRefs.current[transporter.id] }}
                                            open={actionMenuOpen === transporter.id}
                                            onClose={() => setActionMenuOpen(null)}
                                        >
                                            <button
                                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-t-xl"
                                                onClick={() => { setActionMenuOpen(null); handleEditClick(transporter); }}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                            <button
                                                className={`flex items-center gap-2 px-4 py-2 text-yellow-700 hover:bg-yellow-50 text-sm font-medium ${transporter.isActive ? '' : 'hidden'}`}
                                                onClick={() => { setActionMenuOpen(null); handleStatusToggle(transporter.id, transporter.isActive); }}
                                            >
                                                <FaPowerOff /> Deactivate
                                            </button>
                                            <button
                                                className={`flex items-center gap-2 px-4 py-2 text-green-700 hover:bg-green-50 text-sm font-medium ${!transporter.isActive ? '' : 'hidden'}`}
                                                onClick={() => { setActionMenuOpen(null); handleStatusToggle(transporter.id, transporter.isActive); }}
                                            >
                                                <FaPowerOff /> Activate
                                            </button>
                                            <button
                                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium"
                                                onClick={() => { setActionMenuOpen(null); handleDeleteClick(transporter); }}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                            <button
                                                className="flex items-center gap-2 px-4 py-2 text-cyan-700 hover:bg-cyan-50 text-sm font-medium rounded-b-xl"
                                                onClick={() => { setActionMenuOpen(null); navigate(`/superadmin/transporters/${transporter.id}`); }}
                                            >
                                                <FaEye /> View Details
                                            </button>
                                        </PortalDropdown>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Transporter Modal */}
            <ModernModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Transporter"
            >
                {console.log("Modal rendered, isOpen:", showCreateModal)}
                <form onSubmit={handleCreateTransporter} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ModernInput
                            label="Transporter Name"
                            value={createForm.transporterName}
                            onChange={(e) => setCreateForm({...createForm, transporterName: e.target.value})}
                            required
                        />
                        <ModernInput
                            label="GST Number"
                            value={createForm.gstNumber}
                            onChange={(e) => setCreateForm({...createForm, gstNumber: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ModernInput
                            label="Admin Name"
                            value={createForm.adminName}
                            onChange={(e) => setCreateForm({...createForm, adminName: e.target.value})}
                            required
                        />
                        <ModernInput
                            label="Admin Email"
                            type="email"
                            value={createForm.adminEmail}
                            onChange={(e) => setCreateForm({...createForm, adminEmail: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ModernInput
                            label="Admin Password"
                            type="password"
                            value={createForm.adminPassword}
                            onChange={(e) => setCreateForm({...createForm, adminPassword: e.target.value})}
                            required
                        />
                        <ModernInput
                            label="Phone"
                            value={createForm.phone}
                            onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
                        />
                    </div>
                    
                    <ModernInput
                        label="Address"
                        value={createForm.address}
                        onChange={(e) => setCreateForm({...createForm, address: e.target.value})}
                    />
                    
                    <ModernInput
                        label="Domain (Optional)"
                        value={createForm.domain}
                        onChange={(e) => setCreateForm({...createForm, domain: e.target.value})}
                        placeholder="e.g., mycompany.logistics.com"
                    />
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <ModernButton
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="bg-gray-300 hover:bg-gray-400"
                        >
                            Cancel
                        </ModernButton>
                        <ModernButton
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Create Transporter
                        </ModernButton>
                    </div>
                </form>
            </ModernModal>

            {/* Edit Transporter Modal */}
            <ModernModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Edit Transporter"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <ModernInput
                        label="Transporter Name"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditFormChange}
                        required
                    />
                    <ModernInput
                        label="Domain"
                        name="domain"
                        value={editForm.domain}
                        onChange={handleEditFormChange}
                    />
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            name="isActive"
                            checked={editForm.isActive}
                            onChange={handleEditFormChange}
                            className="mr-2"
                        />
                        <label htmlFor="isActive" className="text-sm">Active</label>
                    </div>
                    {editError && <div className="text-red-600">{editError}</div>}
                    <div className="flex justify-end gap-2">
                        <ModernButton type="button" onClick={() => setEditModalOpen(false)} variant="secondary">Cancel</ModernButton>
                        <ModernButton type="submit">Save Changes</ModernButton>
                    </div>
                </form>
            </ModernModal>

            {/* Delete Transporter Modal */}
            <ModernModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Delete Transporter"
            >
                <div className="mb-4">
                    Are you sure you want to delete <b>{deleteTransporter?.name}</b>? This action cannot be undone.
                </div>
                {deleteError && <div className="text-red-600 mb-2">{deleteError}</div>}
                <div className="flex justify-end gap-2">
                    <ModernButton type="button" onClick={() => setDeleteModalOpen(false)} variant="secondary">
                        Cancel
                    </ModernButton>
                    <ModernButton type="button" variant="danger" onClick={handleDeleteConfirm}>
                        Delete
                    </ModernButton>
                </div>
            </ModernModal>
        </div>
    );
};

export default SuperadminDashboard; 