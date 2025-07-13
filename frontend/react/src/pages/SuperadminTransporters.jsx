import React, { useEffect, useState, useRef } from 'react';
import ModernButton from '../components/ModernButton';
import ModernInput from '../components/ModernInput';
import ModernSelect from '../components/ModernSelect';
import ModernModal from '../components/ModernModal';
import { api } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { FaSearch, FaFilter, FaEllipsisV, FaEdit, FaTrash, FaPowerOff } from 'react-icons/fa';
import ReactDOM from 'react-dom';

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

export default function SuperadminTransporters() {
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
  const navigate = useNavigate();
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const actionButtonRefs = useRef({});

  useEffect(() => {
    fetchTransporters();
    // eslint-disable-next-line
  }, [search, status, refresh]);

  const fetchTransporters = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `/superadmin/transporters`;
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (status) params.push(`status=${status}`);
      if (params.length) url += `?${params.join('&')}`;
      const res = await api.get(url);
      setTransporters(Array.isArray(res.data) ? res.data : res);
    } catch (err) {
      setError("Failed to load transporters");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await api.patch(`/superadmin/transporters/${id}/status`, { isActive: !currentStatus });
      setRefresh(r => !r);
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transporter?')) return;
    try {
      await api.delete(`/superadmin/transporters/${id}`);
      setRefresh(r => !r);
    } catch {
      alert('Failed to delete transporter');
    }
  };

  // When opening filter modal, sync pending values
  const openFilter = () => {
    setPendingSearch(searchInput);
    setPendingStatus(status);
    setFilterOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transporters</h1>
        <div className="flex gap-2">
          <ModernButton
            variant="primary"
            size="md"
            onClick={() => navigate('/superadmin/transporters/new')}
          >
            + Add Transporter
          </ModernButton>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700 text-sm font-medium"
            onClick={openFilter}
          >
            <FaFilter className="text-lg" />
            Filter
          </button>
        </div>
      </div>
      <ModernModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filters"
        actions={[
          <ModernButton key="reset" variant="secondary" size="sm" onClick={() => { setPendingSearch(""); setPendingStatus(""); setSearchInput(""); setSearch(""); setStatus(""); setFilterOpen(false); }}>Reset</ModernButton>,
          <ModernButton key="apply" variant="primary" size="sm" onClick={() => { setSearchInput(pendingSearch); setSearch(pendingSearch); setStatus(pendingStatus); setFilterOpen(false); }}>Apply</ModernButton>
        ]}
      >
        <div className="flex flex-col gap-4">
          <ModernInput
            type="text"
            placeholder="Search by name or domain..."
            value={pendingSearch}
            onChange={e => setPendingSearch(e.target.value)}
            className="w-full"
          />
          <ModernSelect
            value={pendingStatus}
            onChange={e => setPendingStatus(e.target.value)}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            className="w-full"
          />
        </div>
      </ModernModal>
      {loading ? (
        <div className="p-8 text-center">Loading transporters...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Domain</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {transporters.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No transporters found.</td></tr>
              ) : transporters.map(t => (
                <tr
                  key={t.id}
                  className="hover:bg-blue-50/60 cursor-pointer group transition"
                  onClick={() => navigate(`/superadmin/transporters/${t.id}`)}
                >
                  <td className="px-4 py-2 font-medium text-gray-900 max-w-[180px] truncate" title={t.name}>{t.name}</td>
                  <td className="px-4 py-2 text-gray-700 max-w-[220px] truncate" title={t.domain}>{t.domain}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-2 py-2 text-center relative" onClick={e => e.stopPropagation()}>
                    <button
                      ref={el => (actionButtonRefs.current[t.id] = el)}
                      className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                      onClick={() => setActionMenuOpen(actionMenuOpen === t.id ? null : t.id)}
                      aria-label="Actions"
                    >
                      <FaEllipsisV className="text-gray-500" />
                    </button>
                    <PortalDropdown
                      anchorRef={{ current: actionButtonRefs.current[t.id] }}
                      open={actionMenuOpen === t.id}
                      onClose={() => setActionMenuOpen(null)}
                    >
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-t-xl"
                        onClick={() => { setActionMenuOpen(null); navigate(`/superadmin/transporters/${t.id}/edit`); }}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className={`flex items-center gap-2 px-4 py-2 text-yellow-700 hover:bg-yellow-50 text-sm font-medium ${t.isActive ? '' : 'hidden'}`}
                        onClick={() => { setActionMenuOpen(null); handleStatusToggle(t.id, t.isActive); }}
                      >
                        <FaPowerOff /> Deactivate
                      </button>
                      <button
                        className={`flex items-center gap-2 px-4 py-2 text-green-700 hover:bg-green-50 text-sm font-medium ${!t.isActive ? '' : 'hidden'}`}
                        onClick={() => { setActionMenuOpen(null); handleStatusToggle(t.id, t.isActive); }}
                      >
                        <FaPowerOff /> Activate
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium rounded-b-xl"
                        onClick={() => { setActionMenuOpen(null); handleDelete(t.id); }}
                      >
                        <FaTrash /> Delete
                      </button>
                    </PortalDropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 