import React, { useEffect, useState } from 'react';
import ModernContentCard from '../components/ModernContentCard';
import { api } from '../api';
import ModernSelect from '../components/ModernSelect';
import ModernButton from '../components/ModernButton';
import { useNavigate } from 'react-router-dom';
import { FaBox, FaUsers, FaRupeeSign, FaBuilding, FaUserPlus, FaUserCheck, FaUserTimes, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import ModernModal from '../components/ModernModal';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import SuperadminLayout from '../components/SuperadminLayout';

export default function SuperadminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topTransporters, setTopTransporters] = useState(null);
  const [recentShipments, setRecentShipments] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [transporterStatus, setTransporterStatus] = useState(null);
  const [transporters, setTransporters] = useState([]);
  const [filters, setFilters] = useState({ transporterId: '', fromDate: '', toDate: '' });
  const [filterOpen, setFilterOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransporters();
  }, []);
  useEffect(() => {
    fetchAllAnalytics();
  }, [filters]);

  const fetchTransporters = async () => {
    try {
      const res = await api.get('/superadmin/transporters');
      setTransporters(res.data || res);
    } catch {}
  };
  const fetchAllAnalytics = () => {
    fetchAnalytics();
    fetchTopTransporters();
    fetchRecentShipments();
    fetchUserGrowth();
    fetchTransporterStatus();
  };
  const getQuery = () => {
    const params = [];
    if (filters.transporterId) params.push(`transporterId=${filters.transporterId}`);
    if (filters.fromDate) params.push(`fromDate=${filters.fromDate}`);
    if (filters.toDate) params.push(`toDate=${filters.toDate}`);
    return params.length ? `?${params.join('&')}` : '';
  };
  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/superadmin/analytics/overview${getQuery()}`);
      setAnalytics(res.data || res);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };
  const fetchTopTransporters = async () => {
    try {
      const res = await api.get(`/superadmin/analytics/top-transporters${getQuery()}`);
      setTopTransporters(res.data || res);
    } catch {}
  };
  const fetchRecentShipments = async () => {
    try {
      const res = await api.get(`/superadmin/analytics/recent-shipments${getQuery()}`);
      setRecentShipments(res.data || res);
    } catch {}
  };
  const fetchUserGrowth = async () => {
    try {
      const res = await api.get(`/superadmin/analytics/user-growth${getQuery()}`);
      setUserGrowth(res.data || res);
    } catch {}
  };
  const fetchTransporterStatus = async () => {
    try {
      const res = await api.get(`/superadmin/analytics/transporter-status${getQuery()}`);
      setTransporterStatus(res.data || res);
    } catch {}
  };

  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  // Add new derived stats
  const newUsers = userGrowth && userGrowth.length ? userGrowth[userGrowth.length - 1]?.count : '--';
  const revenueLast30 = analytics && analytics.monthlyStats && analytics.monthlyStats.length ? analytics.monthlyStats[analytics.monthlyStats.length - 1]?.revenue : '--';

  // Data logic for users
  const totalUsers = analytics?.totalUsers ?? ((analytics?.activeUsers ?? 0) + (analytics?.inactiveUsers ?? 0));
  const activeUsers = analytics?.activeUsers ?? 0;
  const inactiveUsers = Math.max(totalUsers - activeUsers, 0);
  // Data logic for transporters
  const totalTransporters = (transporterStatus?.active ?? 0) + (transporterStatus?.inactive ?? 0);
  const activeTransporters = transporterStatus?.active ?? 0;
  const inactiveTransporters = transporterStatus?.inactive ?? 0;

  return (
    <div>
      <div className="min-h-screen bg-[#f6f8fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title and Filter Button Row */}
          <div className="flex items-center justify-between mb-4 mt-2">
            <h1 className="text-xl font-semibold text-gray-900">Analytics Overview</h1>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-700 text-sm font-medium"
              onClick={() => setFilterOpen(true)}
            >
              <FaFilter className="text-lg" />
              Filter
            </button>
          </div>
          {/* Filter Dropdown Modal */}
          <ModernModal open={filterOpen} onClose={() => setFilterOpen(false)} title="Filters"
            actions={[
              <ModernButton key="reset" variant="secondary" size="sm" onClick={() => { setFilters({ transporterId: '', fromDate: '', toDate: '' }); setFilterOpen(false); }}>Reset</ModernButton>,
              <ModernButton key="apply" variant="primary" size="sm" onClick={() => setFilterOpen(false)}>Apply</ModernButton>
            ]}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="block text-xs font-semibold mb-1 text-gray-500">Transporter</label>
                <ModernSelect
                  value={filters.transporterId}
                  onChange={e => setFilters(f => ({ ...f, transporterId: e.target.value }))}
                  options={[{ value: '', label: 'All Transporters' }, ...transporters.map(t => ({ value: t.id, label: t.name }))]}
                  className="min-w-[180px]"
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-xs font-semibold mb-1 text-gray-500">From</label>
                <input type="date" className="border rounded px-2 py-1 min-w-[140px] text-sm" value={filters.fromDate} onChange={e => setFilters(f => ({ ...f, fromDate: e.target.value }))} />
              </div>
              <div className="flex flex-col">
                <label className="block text-xs font-semibold mb-1 text-gray-500">To</label>
                <input type="date" className="border rounded px-2 py-1 min-w-[140px] text-sm" value={filters.toDate} onChange={e => setFilters(f => ({ ...f, toDate: e.target.value }))} />
              </div>
            </div>
          </ModernModal>
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
            {/* Total Shipments */}
            <div
              className="w-full flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-4 transition hover:shadow-lg hover:border-blue-400 cursor-pointer"
              onClick={() => navigate('/superadmin/shipments')}
              title="View all shipments"
            >
              <FaBox className="text-orange-500 text-xl mb-1" />
              <div className="text-xl font-bold text-gray-900">{analytics ? analytics.totalShipments : '--'}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Total Shipments</div>
            </div>
            {/* Active Users */}
            <div
              className="w-full flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-4 transition hover:shadow-lg hover:border-blue-400 cursor-pointer"
              onClick={() => navigate('/superadmin/users?status=active')}
              title="View all active users"
            >
              <FaUsers className="text-cyan-500 text-xl mb-1" />
              <div className="text-xl font-bold text-gray-900">{analytics ? analytics.activeUsers : '--'}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Active Users</div>
            </div>
            {/* Total Revenue */}
            <div
              className="w-full flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-4 transition hover:shadow-lg hover:border-blue-400 cursor-pointer"
              onClick={() => navigate('/superadmin/revenue')}
              title="View revenue details"
            >
              <FaRupeeSign className="text-emerald-500 text-xl mb-1" />
              <div className="text-xl font-bold text-gray-900">{analytics ? analytics.totalRevenue?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : '--'}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Total Revenue</div>
            </div>
            {/* Active Transporters */}
            <div
              className="w-full flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-4 transition hover:shadow-lg hover:border-blue-400 cursor-pointer"
              onClick={() => navigate('/superadmin/transporters?status=active')}
              title="View all active transporters"
            >
              <FaBuilding className="text-blue-500 text-xl mb-1" />
              <div className="text-xl font-bold text-gray-900">{analytics ? analytics.activeTransporters : '--'}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Active Transporters</div>
            </div>
            {/* Inactive Transporters */}
            <div
              className="w-full flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-4 transition hover:shadow-lg hover:border-blue-400 cursor-pointer"
              onClick={() => navigate('/superadmin/transporters?status=inactive')}
              title="View inactive transporters"
            >
              <FaUserTimes className="text-red-400 text-xl mb-1" />
              <div className="text-xl font-bold text-gray-900">{inactiveTransporters}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">Inactive Transporters</div>
            </div>
            {/* New Users (Last Month) */}
            <div
              className="w-full flex flex-col items-center justify-center bg-white border border-gray-200 rounded-xl shadow-sm p-4 transition hover:shadow-lg hover:border-blue-400 cursor-pointer"
              onClick={() => navigate('/superadmin/users?new=1')}
              title="View new users (last month)"
            >
              <FaUserPlus className="text-green-400 text-xl mb-1" />
              <div className="text-xl font-bold text-gray-900">{newUsers}</div>
              <div className="text-xs text-gray-500 font-medium mt-1">New Users (Last Month)</div>
            </div>
          </div>
          {/* Row 1: Line chart (wide) + Gauge chart */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <ModernContentCard className="col-span-2 h-[340px] flex flex-col">
              <div className="font-semibold text-gray-700 mb-2">Monthly Revenue</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={analytics?.monthlyStats || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={m => `${m.month}/${m.year}`} tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => v.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={v => v.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ModernContentCard>
            <ModernContentCard className="col-span-1 h-[340px] flex flex-col justify-center">
              <div className="font-semibold text-gray-700 mb-2">Active vs Inactive Users</div>
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: activeUsers },
                        { name: 'Inactive', value: inactiveUsers }
                      ]}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={70}
                      outerRadius={100}
                      dataKey="value"
                    >
                      <Cell key="active" fill="#34d399" />
                      <Cell key="inactive" fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute left-1/2 top-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full" style={{ pointerEvents: 'none' }}>
                  <FaUsers className="text-cyan-500 text-xl mb-1" />
                  <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
                  <div className="text-xs text-gray-500 font-medium">Total Users</div>
                </div>
                <div className="flex justify-between w-full mt-2 px-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-green-500">{activeUsers}</span>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-gray-400">{inactiveUsers}</span>
                    <span className="text-xs text-gray-500">Inactive</span>
                  </div>
                </div>
              </div>
            </ModernContentCard>
          </div>
          {/* Row 2: Two line charts, equal width */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {topTransporters && (
              <ModernContentCard className="h-[260px] flex flex-col">
                <div className="font-semibold text-gray-700 mb-2">Top Transporters by Shipments</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={topTransporters.byShipments || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ModernContentCard>
            )}
            {topTransporters && (
              <ModernContentCard className="h-[260px] flex flex-col">
                <div className="font-semibold text-gray-700 mb-2">Top Transporters by Revenue</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={topTransporters.byRevenue || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => v.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={v => v.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ModernContentCard>
            )}
          </div>
          {/* Row 3: Gauge (1/3) + Line chart (2/3) */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <ModernContentCard className="col-span-1 h-[340px] flex flex-col justify-center">
              <div className="font-semibold text-gray-700 mb-2">Active vs Inactive Transporters</div>
              <div className="flex-1 flex flex-col items-center justify-center relative">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Active', value: activeTransporters },
                        { name: 'Inactive', value: inactiveTransporters }
                      ]}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={70}
                      outerRadius={100}
                      dataKey="value"
                    >
                      <Cell key="active" fill="#6366f1" />
                      <Cell key="inactive" fill="#f87171" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute left-1/2 top-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center w-full" style={{ pointerEvents: 'none' }}>
                  <FaBuilding className="text-blue-500 text-xl mb-1" />
                  <div className="text-2xl font-bold text-gray-900">{totalTransporters}</div>
                  <div className="text-xs text-gray-500 font-medium">Total Transporters</div>
                </div>
                <div className="flex justify-between w-full mt-2 px-2">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-indigo-500">{activeTransporters}</span>
                    <span className="text-xs text-gray-500">Active</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold text-red-400">{inactiveTransporters}</span>
                    <span className="text-xs text-gray-500">Inactive</span>
                  </div>
                </div>
              </div>
            </ModernContentCard>
            <ModernContentCard className="col-span-2 h-[340px] flex flex-col">
              <div className="font-semibold text-gray-700 mb-2">User Growth (Last 12 Months)</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={userGrowth || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={m => `${m.month}/${m.year}`} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ModernContentCard>
          </div>
          {/* Recent Shipments Table */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Shipments</h3>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transporter</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {recentShipments.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-400">No recent shipments found.</td></tr>
                ) : recentShipments.map(s => (
                  <tr
                    key={s.id}
                    className="hover:bg-blue-50/60 cursor-pointer group transition"
                    onClick={() => navigate(`/superadmin/shipments/${s.id}`)}
                  >
                    <td className="px-4 py-2 text-gray-900 whitespace-nowrap">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-gray-900 max-w-[180px] truncate" title={s.tenant?.name || '—'}>{s.tenant?.name || '—'}</td>
                    <td className="px-4 py-2 text-gray-900">{s.grandTotal?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || '—'}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                        s.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-700'
                          : s.status === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-700'
                          : s.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : s.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {s.status || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 