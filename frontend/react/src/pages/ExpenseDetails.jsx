import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Calendar, FileText, List, Edit, Trash2, Save } from 'lucide-react';
import Layout from '../components/Layout';
import ModernButton from '../components/ModernButton';
import ModernSelect from '../components/ModernSelect';
import { api } from '../api';

const categoryColors = {
  FUEL: 'bg-yellow-100 text-yellow-800',
  MAINTENANCE: 'bg-blue-100 text-blue-800',
  SALARY: 'bg-green-100 text-green-800',
  INSURANCE: 'bg-purple-100 text-purple-800',
  TOLL: 'bg-pink-100 text-pink-800',
  PARKING: 'bg-gray-100 text-gray-800',
  REPAIR: 'bg-orange-100 text-orange-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PAID', label: 'Paid' },
  { value: 'REJECTED', label: 'Rejected' },
];

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  PAID: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
};

// Utility to format numbers in Indian style (K, L, Cr)
function formatIndianAmount(amount) {
  if (amount < 1000) return `₹${amount}`;
  if (amount < 100000) return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K`;
  if (amount < 10000000) return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
  return `₹${(amount / 10000000).toFixed(amount % 10000000 === 0 ? 0 : 2)}Cr`;
}

export default function ExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    fetchExpense();
  }, [id]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/expenses/${id}`);
      setExpense(response);
      setStatus(response.status || 'PENDING');
    } catch (error) {
      alert('Failed to load expense details');
      console.error('Error fetching expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
        alert('Expense deleted successfully');
        navigate('/expenses');
      } catch (error) {
        alert('Failed to delete expense. Please try again.');
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleStatusSave = async () => {
    setStatusSaving(true);
    try {
      await api.put(`/expenses/${id}`, { status });
      alert('Status updated successfully!');
      setExpense({ ...expense, status });
    } catch (error) {
      alert('Failed to update status.');
      console.error('Error updating status:', error);
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading expense details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!expense) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600">Expense not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Expense: {expense.title}</h1>
                  <p className="text-gray-600 mt-1">Detailed expense information</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[expense.status] || 'bg-blue-100 text-blue-800'}`}>{statusOptions.find(s => s.value === expense.status)?.label || expense.status}</span>
            </div>
            {/* Action Buttons Row (no card) */}
            <div className="flex flex-wrap gap-3 justify-end mb-8">
              <button
                onClick={() => navigate(`/expenses/${id}/edit`)}
                className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 h-10 px-4 rounded-lg border border-red-200 bg-white text-red-600 text-sm font-medium shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>

          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Basic Information */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Title</span>
                  <span className="text-blue-700 font-bold text-lg">{expense.title}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Amount</span>
                  <span className="text-green-700 font-bold text-lg">{expense.amount ? formatIndianAmount(Number(expense.amount)) : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-600">Category</span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${categoryColors[expense.category] || 'bg-gray-100 text-gray-800'}`}>{expense.category || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Meta Information */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Meta Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Date</span>
                  <span className="text-gray-800">{expense.date ? new Date(expense.date).toLocaleDateString('en-IN') : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-600">Status</span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[expense.status] || 'bg-blue-100 text-blue-800'}`}>{statusOptions.find(s => s.value === expense.status)?.label || expense.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Update Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-6 mb-8 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <ModernSelect
                label="Status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                options={statusOptions}
                required
                className="w-full md:w-48"
              />
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-blue-100 text-blue-800'}`}>{statusOptions.find(s => s.value === status)?.label || status}</span>
            <button
              onClick={handleStatusSave}
              disabled={statusSaving}
              className="flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              Save Status
            </button>
          </div>

          {/* Description Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <List className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Description</h3>
            </div>
            <div className="text-base text-gray-900 whitespace-pre-line min-h-[40px]">{expense.description || 'N/A'}</div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 