import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import ModernButton from "../components/ModernButton";
import ModernSelect from "../components/ModernSelect";
import { apiFetch } from "../api";
import { FaChartLine, FaMoneyBillWave, FaCalculator, FaDownload, FaCalendarAlt, FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function ProfitLoss() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of current year
    endDate: new Date().toISOString().split('T')[0], // Today
    groupBy: 'month'
  });
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy
      });

      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics/profit-loss?${queryParams}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch P&L data');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching P&L data:', error);
      setError(error.message || 'Failed to fetch P&L data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Use the same currency formatting as dashboard
  const formatIndianAmount = (amount) => {
    if (!amount || isNaN(amount)) return '₹0';
    if (amount < 1000) return `₹${amount}`;
    if (amount < 100000) return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
    if (amount < 10000000) return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
    return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 2)}Cr`;
  };

  const formatPercentage = (value) => {
    if (!value || isNaN(value)) return '0.00%';
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading P&L data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <FaChartLine className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error Loading P&L Data</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
            <ModernButton 
              onClick={fetchData}
              variant="primary"
              className="mt-4"
            >
              Try Again
            </ModernButton>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-2 sm:px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h1>
              <p className="text-gray-600 mt-1">Track your revenue, expenses, and profitability with detailed insights</p>
            </div>
            <div className="flex gap-2">
              <ModernButton 
                onClick={() => navigate("/analytics")}
                variant="secondary"
                className="flex items-center text-sm"
              >
                <FaChartLine className="mr-2" />
                View Analytics
              </ModernButton>
              <ModernButton 
                onClick={() => navigate("/dashboard")}
                variant="primary"
                className="flex items-center text-sm"
              >
                <FaArrowUp className="mr-2" />
                Dashboard
              </ModernButton>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
              <ModernSelect
                value={filters.groupBy}
                onChange={(e) => handleFilterChange('groupBy', e.target.value)}
                options={[
                  { value: 'month', label: 'Monthly' },
                  { value: 'quarter', label: 'Quarterly' },
                  { value: 'year', label: 'Yearly' },
                ]}
              />
            </div>
          </div>
        </div>

        {data && data.summary && (
          <>
            {/* Summary Cards - Modern Gradient Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Revenue Card */}
              <div className="group block rounded-2xl shadow-lg transition-transform transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-green-400/50 border border-gray-100 bg-gradient-to-br from-green-500 to-green-400 relative overflow-hidden min-h-[140px]">
                <div className="absolute right-4 top-4 opacity-30 group-hover:opacity-50 transition-opacity">
                  <FaMoneyBillWave className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col justify-between h-full p-6 relative z-10 min-w-0">
                  <div className="text-3xl md:text-4xl font-extrabold text-white drop-shadow mb-2 truncate" style={{lineHeight: '1.1'}}>
                    {formatIndianAmount(data.summary.totalRevenue)}
                  </div>
                  <div className="text-lg font-semibold text-white/90 drop-shadow mb-1 truncate">Total Revenue</div>
                  <div className="text-xs text-white/70 group-hover:text-white/90 transition-colors">Revenue from shipments</div>
                </div>
              </div>

              {/* Total Expenses Card */}
              <div className="group block rounded-2xl shadow-lg transition-transform transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-red-400/50 border border-gray-100 bg-gradient-to-br from-red-500 to-red-400 relative overflow-hidden min-h-[140px]">
                <div className="absolute right-4 top-4 opacity-30 group-hover:opacity-50 transition-opacity">
                  <FaCalculator className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col justify-between h-full p-6 relative z-10 min-w-0">
                  <div className="text-3xl md:text-4xl font-extrabold text-white drop-shadow mb-2 truncate" style={{lineHeight: '1.1'}}>
                    {formatIndianAmount(data.summary.totalExpenses)}
                  </div>
                  <div className="text-lg font-semibold text-white/90 drop-shadow mb-1 truncate">Total Expenses</div>
                  <div className="text-xs text-white/70 group-hover:text-white/90 transition-colors">All operational costs</div>
                </div>
              </div>

              {/* Net Profit Card */}
              <div className={`group block rounded-2xl shadow-lg transition-transform transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 border border-gray-100 bg-gradient-to-br ${(data.summary.netProfit || 0) >= 0 ? 'from-blue-500 to-blue-400' : 'from-red-500 to-red-400'} relative overflow-hidden min-h-[140px]`}>
                <div className="absolute right-4 top-4 opacity-30 group-hover:opacity-50 transition-opacity">
                  {(data.summary.netProfit || 0) >= 0 ? <FaArrowUp className="w-8 h-8 text-white" /> : <FaArrowDown className="w-8 h-8 text-white" />}
                </div>
                <div className="flex flex-col justify-between h-full p-6 relative z-10 min-w-0">
                  <div className="text-3xl md:text-4xl font-extrabold text-white drop-shadow mb-2 truncate" style={{lineHeight: '1.1'}}>
                    {formatIndianAmount(data.summary.netProfit)}
                  </div>
                  <div className="text-lg font-semibold text-white/90 drop-shadow mb-1 truncate">Net Profit</div>
                  <div className="text-xs text-white/70 group-hover:text-white/90 transition-colors">
                    {(data.summary.netProfit || 0) >= 0 ? 'Profit earned' : 'Loss incurred'}
                  </div>
                </div>
              </div>

              {/* Profit Margin Card */}
              <div className="group block rounded-2xl shadow-lg transition-transform transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-purple-400/50 border border-gray-100 bg-gradient-to-br from-purple-500 to-purple-400 relative overflow-hidden min-h-[140px]">
                <div className="absolute right-4 top-4 opacity-30 group-hover:opacity-50 transition-opacity">
                  <FaChartLine className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col justify-between h-full p-6 relative z-10 min-w-0">
                  <div className="text-3xl md:text-4xl font-extrabold text-white drop-shadow mb-2 truncate" style={{lineHeight: '1.1'}}>
                    {formatPercentage(data.summary.profitMargin)}
                  </div>
                  <div className="text-lg font-semibold text-white/90 drop-shadow mb-1 truncate">Profit Margin</div>
                  <div className="text-xs text-white/70 group-hover:text-white/90 transition-colors">Percentage of profit</div>
                </div>
              </div>
            </div>

            {/* Revenue vs Expenses Chart */}
            {data.grouped && Object.keys(data.grouped).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Revenue vs Expenses Over Time</h2>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600">Expenses</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {Object.entries(data.grouped).map(([period, values]) => (
                    <div key={period} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-900 text-lg">{period}</span>
                        <span className={`font-bold text-lg ${(values.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatIndianAmount(values.profit)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Revenue</span>
                            <span className="font-semibold text-green-600">{formatIndianAmount(values.revenue)}</span>
                          </div>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Expenses</span>
                            <span className="font-semibold text-red-600">{formatIndianAmount(values.expenses)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expense Breakdown */}
            {data.expenses && data.expenses.byCategory && Object.keys(data.expenses.byCategory).length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Expenses by Category</h2>
                  <div className="space-y-4">
                    {Object.entries(data.expenses.byCategory).map(([category, expenses]) => {
                      const total = Array.isArray(expenses) ? expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0) : 0;
                      return (
                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-gray-700 capitalize font-medium">{category.replace(/_/g, ' ')}</span>
                          </div>
                          <span className="font-semibold text-red-600">{formatIndianAmount(total)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {data.revenue && data.revenue.byStatus && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Status</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700 font-medium">Completed</span>
                        </div>
                        <span className="font-semibold text-green-600">
                          {formatIndianAmount(Array.isArray(data.revenue.byStatus.completed) ? data.revenue.byStatus.completed.reduce((sum, s) => sum + Number(s.grandTotal || 0), 0) : 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-700 font-medium">Pending</span>
                        </div>
                        <span className="font-semibold text-yellow-600">
                          {formatIndianAmount(Array.isArray(data.revenue.byStatus.pending) ? data.revenue.byStatus.pending.reduce((sum, s) => sum + Number(s.grandTotal || 0), 0) : 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(!data.grouped || Object.keys(data.grouped).length === 0) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-center">
                  <FaChartLine className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                  <p className="text-gray-600 mb-4">No data available for the selected date range.</p>
                  <p className="text-sm text-gray-500">Try adjusting the date filters to see your P&L data.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 