import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import ModernButton from '../components/ModernButton';
import ModernInput from '../components/ModernInput';
import ModernSelect from '../components/ModernSelect';
import ModernModal from '../components/ModernModal';
import { FaFilter, FaEllipsisV, FaEdit, FaTrash, FaEye, FaDownload } from 'react-icons/fa';
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

export default function SuperadminShipments() {
  const [shipments, setShipments] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingSearch, setPendingSearch] = useState("");
  const [pendingFilters, setPendingFilters] = useState({
    status: "",
    transporterId: "",
    fromDate: "",
    toDate: "",
    paymentMethod: ""
  });
  const [filters, setFilters] = useState({
    status: "",
    transporterId: "",
    fromDate: "",
    toDate: "",
    paymentMethod: ""
  });
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const actionButtonRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransporters();
    fetchShipments();
    // eslint-disable-next-line
  }, [search, filters, refresh]);

  const fetchTransporters = async () => {
    try {
      const res = await api.get('/superadmin/transporters');
      setTransporters(res.data || res);
    } catch (err) {
      setTransporters([]);
    }
  };

  const fetchShipments = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `/superadmin/shipments`;
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (filters.status) params.push(`status=${filters.status}`);
      if (filters.transporterId) params.push(`transporterId=${filters.transporterId}`);
      if (filters.fromDate) params.push(`fromDate=${filters.fromDate}`);
      if (filters.toDate) params.push(`toDate=${filters.toDate}`);
      if (filters.paymentMethod) params.push(`paymentMethod=${filters.paymentMethod}`);
      if (params.length) url += `?${params.join('&')}`;
      
      const res = await api.get(url);
      setShipments(Array.isArray(res.data) ? res.data : res);
    } catch (err) {
      setError("Failed to load shipments");
      setShipments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shipmentId) => {
    if (!window.confirm('Are you sure you want to delete this shipment?')) return;
    try {
      await api.delete(`/superadmin/shipments/${shipmentId}`);
      setRefresh(r => !r);
    } catch {
      alert('Failed to delete shipment');
    }
  };

  // When opening filter modal, sync pending values
  const openFilter = () => {
    setPendingSearch(search);
    setPendingFilters(filters);
    setFilterOpen(true);
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const paymentMethodOptions = [
    { value: '', label: 'All Payment Methods' },
    { value: 'TO_PAY', label: 'To Pay' },
    { value: 'PAID', label: 'Paid' },
    { value: 'TO_BE_BILLED', label: 'To Be Billed' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatPaymentMethod = (method) => {
    if (!method) return '—';
    return method
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Shipments</h1>
        <div className="flex gap-2">
          <ModernButton
            variant="primary"
            size="md"
            onClick={() => navigate('/superadmin/shipments/new')}
          >
            + Add Shipment
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
          <ModernButton key="reset" variant="secondary" size="sm" onClick={() => { setPendingSearch(""); setPendingFilters({ status: "", transporterId: "", fromDate: "", toDate: "", paymentMethod: "" }); setSearch(""); setFilters({ status: "", transporterId: "", fromDate: "", toDate: "", paymentMethod: "" }); setFilterOpen(false); }}>Reset</ModernButton>,
          <ModernButton key="apply" variant="primary" size="sm" onClick={() => { setSearch(pendingSearch); setFilters(pendingFilters); setFilterOpen(false); }}>Apply</ModernButton>
        ]}
      >
        <div className="flex flex-col gap-4">
          <ModernInput
            type="text"
            placeholder="Search shipments..."
            value={pendingSearch}
            onChange={e => setPendingSearch(e.target.value)}
            className="w-full"
          />
          <ModernSelect
            value={pendingFilters.status}
            onChange={e => setPendingFilters(f => ({ ...f, status: e.target.value }))}
            options={statusOptions}
            className="w-full"
          />
          <ModernSelect
            value={pendingFilters.transporterId}
            onChange={e => setPendingFilters(f => ({ ...f, transporterId: e.target.value }))}
            options={[{ value: '', label: 'All Transporters' }, ...transporters.map(t => ({ value: t.id, label: t.name }))]}
            className="w-full"
          />
          <ModernSelect
            value={pendingFilters.paymentMethod}
            onChange={e => setPendingFilters(f => ({ ...f, paymentMethod: e.target.value }))}
            options={paymentMethodOptions}
            className="w-full"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">From Date</label>
              <input 
                type="date" 
                className="border rounded px-2 py-1 w-full text-sm" 
                value={pendingFilters.fromDate} 
                onChange={e => setPendingFilters(f => ({ ...f, fromDate: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-500">To Date</label>
              <input 
                type="date" 
                className="border rounded px-2 py-1 w-full text-sm" 
                value={pendingFilters.toDate} 
                onChange={e => setPendingFilters(f => ({ ...f, toDate: e.target.value }))} 
              />
            </div>
          </div>
        </div>
      </ModernModal>

      {loading ? (
        <div className="p-8 text-center">Loading shipments...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Shipment ID</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Transporter</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Destination</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-2 py-2 text-center font-semibold text-gray-500 uppercase tracking-wider min-w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 text-sm">
                {shipments.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-400">No shipments found.</td></tr>
                ) : shipments.map(shipment => (
                  <tr
                    key={shipment.id}
                    className="hover:bg-blue-50/60 cursor-pointer group transition"
                    onClick={() => navigate(`/superadmin/shipments/${shipment.id}`)}
                  >
                    <td className="px-4 py-2 font-medium text-gray-900 max-w-[120px] truncate">{shipment.id}</td>
                    <td className="px-4 py-2 text-gray-900 max-w-[180px] truncate">{shipment.tenant?.name || '—'}</td>
                    <td className="px-4 py-2 text-gray-700 max-w-[150px] truncate">{shipment.source || '—'}</td>
                    <td className="px-4 py-2 text-gray-700 max-w-[150px] truncate">{shipment.destination || '—'}</td>
                    <td className="px-4 py-2 text-gray-900">{shipment.grandTotal?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)}`}>{shipment.status || '—'}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{formatPaymentMethod(shipment.paymentMethod)}</td>
                    <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-2 py-2 text-center relative min-w-[80px]" onClick={e => e.stopPropagation()}>
                      <button
                        ref={el => (actionButtonRefs.current[shipment.id] = el)}
                        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                        onClick={() => setActionMenuOpen(actionMenuOpen === shipment.id ? null : shipment.id)}
                        aria-label="Actions"
                      >
                        <FaEllipsisV className="text-gray-500" />
                      </button>
                      <PortalDropdown
                        anchorRef={{ current: actionButtonRefs.current[shipment.id] }}
                        open={actionMenuOpen === shipment.id}
                        onClose={() => setActionMenuOpen(null)}
                      >
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 text-sm font-medium rounded-t-xl"
                          onClick={() => { setActionMenuOpen(null); navigate(`/superadmin/shipments/${shipment.id}/edit`); }}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-cyan-700 hover:bg-cyan-50 text-sm font-medium"
                          onClick={() => { setActionMenuOpen(null); navigate(`/superadmin/shipments/${shipment.id}`); }}
                        >
                          <FaEye /> View Details
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-green-700 hover:bg-green-50 text-sm font-medium"
                          onClick={() => { setActionMenuOpen(null); /* Add download functionality */ }}
                        >
                          <FaDownload /> Download
                        </button>
                        <button
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium rounded-b-xl"
                          onClick={() => { setActionMenuOpen(null); handleDelete(shipment.id); }}
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
        </div>
      )}
    </div>
  );
} 