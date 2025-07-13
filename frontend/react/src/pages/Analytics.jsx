import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import Layout from '../components/Layout';
import ModernInput from '../components/ModernInput';
import ModernButton from '../components/ModernButton';
import ModernContentCard from '../components/ModernContentCard';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

// Modern color palette
const chartColors = [
  '#38bdf8', // blue
  '#10b981', // teal
  '#fbbf24', // yellow
  '#a3a3a3', // gray
  '#f87171', // red
  '#a78bfa', // purple
];

// Elegant Stat Card component
function StatCard({ icon, label, value, trend, color = "blue", valueClass = "" }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    red: "bg-red-50 border-red-200 text-red-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700"
  };
  const iconBg = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
    red: "bg-red-100",
    indigo: "bg-indigo-100"
  };
  return (
    <div className={`border border-gray-100 rounded-2xl shadow-lg p-6 min-h-[128px] flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${colorClasses[color]} bg-opacity-60`}> 
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-xl ${iconBg[color]} flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-end">
        <p className="text-sm font-medium text-gray-600 mb-1" title={label}>{label}</p>
        <div className={`break-words leading-tight ${valueClass}`}>{value}</div>
      </div>
    </div>
  );
}

// Format currency in compact form (e.g., 10K, 1L, 1Cr)
function formatCompactINR(amount) {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(amount % 1e7 === 0 ? 0 : 2)}Cr`;
  if (amount >= 1e5) return `₹${(amount / 1e5).toFixed(amount % 1e5 === 0 ? 0 : 2)}L`;
  if (amount >= 1e3) return `₹${(amount / 1e3).toFixed(amount % 1e3 === 0 ? 0 : 2)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pending, setPending] = useState(false);

  const fetchAnalytics = async (from, to) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/analytics/overview`;
      const params = [];
      if (from) params.push(`fromDate=${from}`);
      if (to) params.push(`toDate=${to}`);
      if (params.length) url += `?${params.join('&')}`;
      const response = await apiFetch(url);
      setAnalytics(await response.json());
    } catch (error) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setPending(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleApply = (e) => {
    e.preventDefault();
    setPending(true);
    fetchAnalytics(fromDate, toDate);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setPending(true);
    fetchAnalytics();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return '--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 text-lg">Loading analytics data...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
              <div className="text-center py-12">
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Error Loading Analytics</span>
                  </div>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg">No analytics data available</div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Modern chart options
  const modernOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { 
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 12 } },
      },
      y: {
        grid: { color: '#f3f4f6', borderDash: [2, 2] },
        ticks: { color: '#6b7280', font: { size: 12 } },
        beginAtZero: true,
      },
    },
  };

  const revenueChartData = {
    labels: analytics.revenueByMonth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Revenue',
        data: analytics.revenueByMonth?.map(item => item.revenue) || [],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56,189,248,0.08)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#38bdf8',
      },
    ],
  };

  const revenueChartOptions = {
    ...modernOptions,
    layout: {
      padding: { top: 32, right: 0, bottom: 0, left: 0 },
    },
    plugins: {
      ...modernOptions.plugins,
      datalabels: {
        display: true,
        align: 'bottom',
        anchor: 'center',
        offset: 4,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#38bdf8',
        color: '#1f2937',
        font: { weight: 'bold', size: 12 },
        padding: { top: 1, bottom: 1, left: 4, right: 4 },
        formatter: value => formatCurrency(value),
        clip: false,
      },
    },
  };

  const shipmentsChartData = {
    labels: analytics.shipmentsPerMonth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Shipments',
        data: analytics.shipmentsPerMonth?.map(item => item.count) || [],
        backgroundColor: 'rgba(16,185,129,0.18)',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
    ],
  };

  const statusChartData = {
    labels: analytics.shipmentsByStatus?.map(item => item.status) || [],
    datasets: [
      {
        data: analytics.shipmentsByStatus?.map(item => item._count.status) || [],
        backgroundColor: chartColors,
        borderWidth: 0,
        datalabels: {
          color: '#1f2937',
          font: { weight: 'bold', size: 14 },
          formatter: (value, ctx) => {
            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            if (!total) return '';
            const percent = Math.round((value / total) * 100);
            return percent > 0 ? percent + '%' : '';
          },
        },
      },
    ],
  };

  const paymentChartData = {
    labels: analytics.shipmentsByPaymentMethod?.map(item => item.paymentMethod) || [],
    datasets: [
      {
        data: analytics.shipmentsByPaymentMethod?.map(item => item._count.paymentMethod) || [],
        backgroundColor: chartColors,
        borderWidth: 0,
        datalabels: {
          color: '#1f2937',
          font: { weight: 'bold', size: 14 },
          formatter: (value, ctx) => {
            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            if (!total) return '';
            const percent = Math.round((value / total) * 100);
            return percent > 0 ? percent + '%' : '';
          },
        },
      },
    ],
  };

  const doughnutOptions = {
    plugins: {
      legend: { display: false },
      datalabels: {
        display: true,
        anchor: 'center',
        align: 'center',
        color: '#1f2937',
        font: { weight: 'bold', size: 14 },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percent = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percent}%)`;
          },
        },
      },
    },
    cutout: '70%',
    maintainAspectRatio: false,
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-gray-600 mt-1">Comprehensive insights into your logistics operations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-6">
              <div className="flex flex-col sm:flex-row items-end gap-4">
                <div className="flex-1 min-w-[120px]">
                  <ModernInput
                    label="From Date"
                    type="date"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    max={toDate || undefined}
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <ModernInput
                    label="To Date"
                    type="date"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    min={fromDate || undefined}
                  />
                </div>
                <div className="flex gap-3">
                  <ModernButton
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={handleApply}
                    disabled={pending || (!fromDate && !toDate)}
                    className="flex items-center space-x-2"
                  >
                    {pending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span>Apply Filter</span>
                      </>
                    )}
                  </ModernButton>
                  {(fromDate || toDate) && (
                    <ModernButton
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={handleReset}
                      disabled={pending}
                      className="flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Reset</span>
                    </ModernButton>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Row 1: Revenue Trend chart (full width) */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Revenue Trend</h3>
                  <p className="text-sm text-gray-600">Last 12 months performance</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <Line data={revenueChartData} options={revenueChartOptions} height={120} />
            </div>
          </div>

          {/* Row 2: Shipment Trend chart (2/3) + 2 Cards (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Shipments Trend</h3>
                    <p className="text-sm text-gray-600">Monthly shipment volume</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <Bar data={shipmentsChartData} options={modernOptions} height={120} />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <StatCard
                icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                label="Total Shipments"
                value={<span className="text-2xl font-bold text-gray-900">{analytics.totalShipments?.toLocaleString() || '0'}</span>}
                color="blue"
              />
              <StatCard
                icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                label="Top Driver"
                value={<span className="text-lg font-semibold text-gray-900 break-words">{analytics.topDrivers?.[0]?.name || '--'}</span>}
                color="purple"
                valueClass="text-lg font-semibold text-gray-900"
              />
            </div>
          </div>

          {/* Row 3: 2 Cards stacked (left) + Shipment Status (right) in a single row */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="flex flex-col gap-6 lg:w-1/3">
              <StatCard
                icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                label="Top Vehicle"
                value={<span className="text-base font-bold text-gray-900 break-words">{analytics.topVehicles?.[0]?.number || '--'}</span>}
                color="orange"
                valueClass="text-base font-bold text-gray-900"
              />
              <StatCard
                icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                label="Avg Delivery Time"
                value={<span className="text-2xl font-bold text-gray-900">{formatTime(analytics.avgDeliveryTimeSeconds)}</span>}
                color="indigo"
              />
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-4 h-[376px] flex flex-col lg:w-2/3 justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Shipments by Status</h3>
                  <p className="text-sm text-gray-600">Distribution across statuses</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <Doughnut data={statusChartData} options={doughnutOptions} width={120} height={120} />
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {statusChartData.labels.map((label, i) => (
                  <span key={label} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: statusChartData.datasets[0].backgroundColor[i] }}></span>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: 2 Cards (1/3) + Payment Methods (2/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col gap-6 lg:col-span-1">
              <StatCard
                icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                label="Recent Shipments"
                value={<span className="text-2xl font-bold text-gray-900">{analytics.recentShipments?.length || 0}</span>}
                color="red"
              />
              <StatCard
                icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
                label="Total Revenue"
                value={<span className="text-2xl font-bold text-gray-900">{formatCompactINR(analytics.totalRevenue || 0)}</span>}
                color="green"
              />
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-4 h-[376px] flex flex-col lg:col-span-2 justify-between">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Payment Methods</h3>
                  <p className="text-sm text-gray-600">Payment distribution</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <Doughnut data={paymentChartData} options={doughnutOptions} width={120} height={120} />
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {paymentChartData.labels.map((label, i) => (
                  <span key={label} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="inline-block w-3 h-3 rounded-full" style={{ background: paymentChartData.datasets[0].backgroundColor[i] }}></span>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Top Drivers</h3>
                  <p className="text-sm text-gray-600">Best performing drivers</p>
                </div>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                {analytics.topDrivers?.map((driver, index) => (
                  <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-800">{driver.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{driver.shipmentCount} shipments</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Top Vehicles</h3>
                  <p className="text-sm text-gray-600">Most utilized vehicles</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                {analytics.topVehicles?.map((vehicle, index) => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800">{vehicle.number}</span>
                        <span className="text-sm text-gray-500 ml-2">({vehicle.model})</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{vehicle.shipmentCount} shipments</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Shipments */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Recent Shipments</h3>
                <p className="text-sm text-gray-600">Latest shipment activities</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Shipment ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Driver</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Vehicle</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analytics.recentShipments?.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-800 font-medium">#{shipment.id}</td>
                      <td className="py-3 px-4 text-gray-700">{shipment.driver?.user?.name || '--'}</td>
                      <td className="py-3 px-4 text-gray-700">{shipment.vehicle?.number || '--'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                          shipment.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                          shipment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{formatCurrency(shipment.grandTotal || 0)}</td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(shipment.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 