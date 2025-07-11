import { useEffect, useState } from 'react';
import axios from 'axios';
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

// Minimalist icons (outline style)
const Icons = {
  shipments: <span role="img" aria-label="box">📦</span>,
  revenue: <span role="img" aria-label="money">💵</span>,
  drivers: <span role="img" aria-label="driver">🧑‍✈️</span>,
  vehicles: <span role="img" aria-label="truck">🚚</span>,
  time: <span role="img" aria-label="clock">⏳</span>,
  recent: <span role="img" aria-label="recent">🕒</span>,
};

// Modern color palette
const chartColors = [
  '#38bdf8', // blue
  '#10b981', // teal
  '#fbbf24', // yellow
  '#a3a3a3', // gray
  '#f87171', // red
  '#a78bfa', // purple
];

// Elegant Card component for dashboard
function StatCard({ icon, label, value }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-6 min-h-[120px] transition hover:shadow-md hover:-translate-y-1 duration-150 w-full">
      <span className="mb-1 text-xl opacity-70" style={{ fontSize: 26, lineHeight: 1 }}>{icon}</span>
      <span className="text-[11px] text-gray-500 font-medium mb-0.5 tracking-wide uppercase text-center">{label}</span>
      <span className="text-lg font-semibold text-gray-900 mt-1 max-w-[120px] truncate text-center" title={value}>{value}</span>
    </div>
  );
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
      const token = localStorage.getItem('token');
      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/analytics/overview`;
      const params = [];
      if (from) params.push(`fromDate=${from}`);
      if (to) params.push(`toDate=${to}`);
      if (params.length) url += `?${params.join('&')}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setAnalytics(response.data);
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
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <div className="p-8 text-center text-gray-400">No analytics data available</div>
      </Layout>
    );
  }

  // Minimalist chart options
  const minimalistOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#A0AEC0', font: { size: 12 } },
      },
      y: {
        grid: { color: '#F1F5F9', borderDash: [2, 2] },
        ticks: { color: '#A0AEC0', font: { size: 12 } },
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
    ...minimalistOptions,
    layout: {
      ...minimalistOptions.layout,
      padding: { top: 32, right: 0, bottom: 0, left: 0 }, // Add extra top padding
    },
    plugins: {
      ...minimalistOptions.plugins,
      datalabels: {
        display: true,
        align: 'bottom', // Place label below the point
        anchor: 'center', // Centered on the point
        offset: 4,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#38bdf8',
        color: '#222',
        font: { weight: 'bold', size: 12 }, // Smaller font
        padding: { top: 1, bottom: 1, left: 4, right: 4 }, // Smaller padding
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
          color: '#222',
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
          color: '#222',
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
        color: '#222',
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-7 text-gray-900 tracking-tight text-center">Analytics Dashboard</h1>

        {/* Date Range Filter */}
        <div className="flex justify-center mb-8">
          <ModernContentCard className="w-full max-w-2xl mb-0">
            <form onSubmit={handleApply} className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[120px]">
                <ModernInput
                  label="From"
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  max={toDate || undefined}
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <ModernInput
                  label="To"
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  min={fromDate || undefined}
                />
              </div>
              <ModernButton
                type="submit"
                variant="primary"
                size="md"
                className="mt-5"
                disabled={pending || (!fromDate && !toDate)}
              >
                {pending ? 'Loading...' : 'Apply'}
              </ModernButton>
              {(fromDate || toDate) && (
                <ModernButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-5"
                  onClick={handleReset}
                  disabled={pending}
                >
                  Reset
                </ModernButton>
              )}
            </form>
          </ModernContentCard>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard
            icon={<span role="img" aria-label="box" style={{ fontSize: 24 }}>📦</span>}
            label="Total Shipments"
            value={analytics.totalShipments?.toLocaleString() || '0'}
          />
          <StatCard
            icon={<span role="img" aria-label="money" style={{ fontSize: 24 }}>💵</span>}
            label="Total Revenue"
            value={formatCurrency(analytics.totalRevenue || 0)}
          />
          <StatCard
            icon={<span role="img" aria-label="driver" style={{ fontSize: 24 }}>🧑‍✈️</span>}
            label="Top Driver"
            value={analytics.topDrivers?.[0]?.name || '--'}
          />
          <StatCard
            icon={<span role="img" aria-label="truck" style={{ fontSize: 24 }}>🚚</span>}
            label="Top Vehicle"
            value={analytics.topVehicles?.[0]?.number || '--'}
          />
          <StatCard
            icon={<span role="img" aria-label="clock" style={{ fontSize: 24 }}>⏳</span>}
            label="Avg Delivery Time"
            value={formatTime(analytics.avgDeliveryTimeSeconds)}
          />
          <StatCard
            icon={<span role="img" aria-label="recent" style={{ fontSize: 24 }}>🕒</span>}
            label="Recent Shipments"
            value={analytics.recentShipments?.length || 0}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 pt-10">
            <div className="text-sm text-gray-500 mb-2">Revenue Trend (Last 12 Months)</div>
            <Line data={revenueChartData} options={revenueChartOptions} height={180} />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-2">Shipments Trend (Last 12 Months)</div>
            <Bar data={shipmentsChartData} options={minimalistOptions} height={180} />
          </div>
        </div>

        {/* Status and Payment Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center">
            <div className="text-lg font-semibold text-gray-800 mb-4">Shipments by Status</div>
            <div className="w-full flex justify-center" style={{ minHeight: 260 }}>
              <Doughnut data={statusChartData} options={doughnutOptions} width={220} height={220} />
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {statusChartData.labels.map((label, i) => (
                <span key={label} className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: statusChartData.datasets[0].backgroundColor[i] }}></span>
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center">
            <div className="text-lg font-semibold text-gray-800 mb-4">Shipments by Payment Method</div>
            <div className="w-full flex justify-center" style={{ minHeight: 260 }}>
              <Doughnut data={paymentChartData} options={doughnutOptions} width={220} height={220} />
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {paymentChartData.labels.map((label, i) => (
                <span key={label} className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: paymentChartData.datasets[0].backgroundColor[i] }}></span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-4">Top 5 Drivers</div>
            <ul className="space-y-2">
              {analytics.topDrivers?.map((driver, index) => (
                <li key={driver.id} className="flex items-center justify-between px-2 py-2 rounded hover:bg-gray-50">
                  <span className="text-gray-700 font-medium">{index + 1}. {driver.name}</span>
                  <span className="text-xs text-gray-400">{driver.shipmentCount} shipments</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-4">Top 5 Vehicles</div>
            <ul className="space-y-2">
              {analytics.topVehicles?.map((vehicle, index) => (
                <li key={vehicle.id} className="flex items-center justify-between px-2 py-2 rounded hover:bg-gray-50">
                  <span className="text-gray-700 font-medium">{index + 1}. {vehicle.number} <span className="text-xs text-gray-400">({vehicle.model})</span></span>
                  <span className="text-xs text-gray-400">{vehicle.shipmentCount} shipments</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Shipments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-500 mb-4">Recent Shipments</div>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-gray-400">Shipment ID</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400">Driver</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400">Vehicle</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400">Amount</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentShipments?.map((shipment) => (
                  <tr key={shipment.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-700">{shipment.id}</td>
                    <td className="py-2 px-3 text-gray-700">{shipment.driver?.user?.name || '--'}</td>
                    <td className="py-2 px-3 text-gray-700">{shipment.vehicle?.number || '--'}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        shipment.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                        shipment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-700">{formatCurrency(shipment.grandTotal || 0)}</td>
                    <td className="py-2 px-3 text-gray-700">{formatDate(shipment.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
} 