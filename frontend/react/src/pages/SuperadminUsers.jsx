import React, { useEffect, useState, useRef } from 'react';
import ModernContentCard from '../components/ModernContentCard';
import ModernButton from '../components/ModernButton';
import ModernInput from '../components/ModernInput';
import ModernSelect from '../components/ModernSelect';
import { api } from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEllipsisV, FaEdit, FaTrash, FaPowerOff, FaEye } from 'react-icons/fa';
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

const roleOptions = [
  { value: '', label: 'All Roles' },
  { value: 'SUPERADMIN', label: 'Superadmin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'DISPATCHER', label: 'Dispatcher' },
  { value: 'DRIVER', label: 'Driver' },
];

export default function SuperadminUsers() {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const actionButtonRefs = useRef({});
  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL parameters for search
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && searchParam !== search) {
      setSearch(searchParam);
      // Automatically filter when search parameter is present
      fetchUsers({ role, tenantId, search: searchParam });
    }
  }, [location.search, search, role, tenantId]);

  useEffect(() => {
    fetchTenants();
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await api.get('/superadmin/transporters');
      setTenants(res.data || res);
    } catch (err) {
      setTenants([]);
    }
  };

  const fetchUsers = async (filters = {}) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.tenantId ? { tenantId: filters.tenantId } : {}),
        ...(filters.search ? { search: filters.search } : {}),
      });
      const res = await api.get(`/superadmin/users?${params.toString()}`);
      setUsers(res.data || res);
    } catch (err) {
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchUsers({ role, tenantId, search });
  };

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/users/${user.id}/status`, { isActive: !user.isActive });
      fetchUsers({ role, tenantId, search });
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers({ role, tenantId, search });
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-end gap-4">
        <ModernInput
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email"
        />
        <ModernSelect
          label="Role"
          value={role}
          onChange={e => setRole(e.target.value)}
          options={roleOptions}
        />
        <ModernSelect
          label="Transporter"
          value={tenantId}
          onChange={e => setTenantId(e.target.value)}
          options={[{ value: '', label: 'All Transporters' }, ...tenants.map(t => ({ value: t.id, label: t.name }))]}
        />
        <ModernButton onClick={handleFilter} className="h-12">Filter</ModernButton>
      </div>
      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Users</h2>
        </div>
        {error && <div className="px-6 py-2 text-red-600 text-sm">{error}</div>}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transporter</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No users found.</td></tr>
            ) : users.map(user => (
              <tr
                key={user.id}
                className="hover:bg-blue-50/60 cursor-pointer group transition"
                onClick={() => navigate(`/superadmin/users/${user.id}`)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/superadmin/users/${user.id}`); }}
                aria-label={`View details for ${user.name}`}
              >
                <td className="px-4 py-2 font-medium text-gray-900 max-w-[180px] truncate" title={user.name}>{user.name}</td>
                <td className="px-4 py-2 text-gray-700 max-w-[220px] truncate" title={user.email}>{user.email}</td>
                <td className="px-4 py-2">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'SUPERADMIN' 
                      ? 'bg-purple-100 text-purple-700'
                      : user.role === 'ADMIN'
                      ? 'bg-blue-100 text-blue-700'
                      : user.role === 'DISPATCHER'
                      ? 'bg-green-100 text-green-700'
                      : user.role === 'DRIVER'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-900 max-w-[180px] truncate" title={user.tenant ? user.tenant.name : '—'}>
                  {user.tenant ? user.tenant.name : '—'}
                </td>
                <td className="px-4 py-2 text-gray-500 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-2 py-2 text-center relative" onClick={e => e.stopPropagation()}>
                  <button
                    ref={el => (actionButtonRefs.current[user.id] = el)}
                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                    onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                    aria-label="Actions"
                  >
                    <FaEllipsisV className="text-gray-500" />
                  </button>
                  <PortalDropdown
                    anchorRef={{ current: actionButtonRefs.current[user.id] }}
                    open={actionMenuOpen === user.id}
                    onClose={() => setActionMenuOpen(null)}
                  >
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-t-xl"
                      onClick={() => { setActionMenuOpen(null); navigate(`/superadmin/users/${user.id}/edit`); }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className={`flex items-center gap-2 px-4 py-2 text-yellow-700 hover:bg-yellow-50 text-sm font-medium ${user.isActive ? '' : 'hidden'}`}
                      onClick={() => { setActionMenuOpen(null); handleToggleActive(user); }}
                    >
                      <FaPowerOff /> Deactivate
                    </button>
                    <button
                      className={`flex items-center gap-2 px-4 py-2 text-green-700 hover:bg-green-50 text-sm font-medium ${!user.isActive ? '' : 'hidden'}`}
                      onClick={() => { setActionMenuOpen(null); handleToggleActive(user); }}
                    >
                      <FaPowerOff /> Activate
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium"
                      onClick={() => { setActionMenuOpen(null); handleDeleteUser(user.id); }}
                    >
                      <FaTrash /> Delete
                    </button>
                    <button
                      className="flex items-center gap-2 px-4 py-2 text-cyan-700 hover:bg-cyan-50 text-sm font-medium rounded-b-xl"
                      onClick={() => { setActionMenuOpen(null); navigate(`/superadmin/users/${user.id}`); }}
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
  );
} 