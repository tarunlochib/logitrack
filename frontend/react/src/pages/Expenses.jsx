import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  MoreVertical,
  IndianRupee
} from 'lucide-react';
import Layout from '../components/Layout';
import ModernButton from '../components/ModernButton';
import SearchInput from '../components/SearchInput';
import StatusBadge from '../components/StatusBadge';
import { api } from '../api';
import ReactDOM from 'react-dom';

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

// Utility to format numbers in Indian style (K, L, Cr)
function formatIndianAmount(amount) {
  if (amount < 1000) return `₹${amount}`;
  if (amount < 100000) return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  if (amount < 10000000) return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
  return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 2)}Cr`;
}

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const actionButtonRefs = useRef({});
  const navigate = useNavigate();

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'FUEL', label: 'Fuel' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'SALARY', label: 'Salary' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'TOLL', label: 'Toll' },
    { value: 'PARKING', label: 'Parking' },
    { value: 'REPAIR', label: 'Repair' },
    { value: 'OTHER', label: 'Other' }
  ];

  const statuses = [
    { value: '', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'PAID', label: 'Paid' }
  ];

  useEffect(() => {
    fetchExpenses();
  }, [searchTerm, categoryFilter, statusFilter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: 1,
        limit: 1000,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await api.get(`/expenses?${params}`);
      setExpenses(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, expenseId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${expenseId}`);
        alert('Expense deleted successfully');
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Failed to delete expense. Please try again.');
      }
    }
  };

  const handleRowClick = (expenseId) => {
    navigate(`/expenses/${expenseId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: TrendingUp },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: TrendingDown },
      PAID: { color: 'bg-blue-100 text-blue-800', icon: DollarSign }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      FUEL: '⛽',
      MAINTENANCE: '🔧',
      SALARY: '💰',
      INSURANCE: '🛡️',
      TOLL: '🛣️',
      PARKING: '🅿️',
      REPAIR: '🔨',
      OTHER: '📋'
    };
    return iconMap[category] || '📋';
  };

  const getExpenseStats = () => {
    const total = expenses.length;
    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const pendingAmount = expenses.filter(e => e.status === 'PENDING').reduce((sum, e) => sum + Number(e.amount), 0);
    const paidAmount = expenses.filter(e => e.status === 'PAID').reduce((sum, e) => sum + Number(e.amount), 0);
    const approvedAmount = expenses.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + Number(e.amount), 0);
    return { total, totalAmount, pendingAmount, paidAmount, approvedAmount };
  };

  const stats = getExpenseStats();

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    const matchesStatus = !statusFilter || expense.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <Layout>
      <div className="px-2 sm:px-4 md:px-6 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
              <p className="text-gray-600">Track and manage your company expenses</p>
            </div>
            <ModernButton
              onClick={() => navigate("/expenses/new")}
              variant="primary"
              className="flex items-center justify-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Expense
            </ModernButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">{formatIndianAmount(stats.totalAmount)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{formatIndianAmount(stats.pendingAmount)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-gray-900">{formatIndianAmount(stats.paidAmount)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Count</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search expenses by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading expenses...</p>
            </div>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">💰</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Expenses Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || categoryFilter || statusFilter 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first expense."
                }
              </p>
              <ModernButton 
                onClick={() => navigate("/expenses/new")}
                variant="primary"
                className="w-full justify-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Expense
              </ModernButton>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Expenses</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expense</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="hover:bg-blue-50/60 cursor-pointer group transition"
                      onClick={() => handleRowClick(expense.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{expense.title}</p>
                            <p className="text-sm text-gray-500">{expense.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getCategoryIcon(expense.category)}</span>
                          <span className="text-gray-900">{expense.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <IndianRupee className="w-4 h-4 text-green-500" />
                          <span className="text-gray-900">{formatIndianAmount(Number(expense.amount))}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {expense.date && !isNaN(new Date(expense.date).getTime())
                              ? new Date(expense.date).toLocaleDateString('en-IN')
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(expense.status)}
                      </td>
                      <td className="px-6 py-4 text-center relative" onClick={e => e.stopPropagation()}>
                        <button
                          ref={el => (actionButtonRefs.current[expense.id] = el)}
                          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                          onClick={() => setActionMenuOpen(actionMenuOpen === expense.id ? null : expense.id)}
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        <PortalDropdown
                          anchorRef={{ current: actionButtonRefs.current[expense.id] }}
                          open={actionMenuOpen === expense.id}
                          onClose={() => setActionMenuOpen(null)}
                        >
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-cyan-700 hover:bg-cyan-50 text-sm font-medium rounded-t-xl"
                            onClick={() => { setActionMenuOpen(null); navigate(`/expenses/${expense.id}`); }}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-yellow-700 hover:bg-yellow-50 text-sm font-medium"
                            onClick={() => { setActionMenuOpen(null); navigate(`/expenses/${expense.id}/edit`); }}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium rounded-b-xl"
                            onClick={e => { setActionMenuOpen(null); handleDelete(e, expense.id); }}
                          >
                            <Trash2 className="w-4 h-4" />
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
};

export default Expenses; 