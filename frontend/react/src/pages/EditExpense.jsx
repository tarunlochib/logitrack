import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, IndianRupee, Calendar, FileText, List, Save, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import ModernButton from '../components/ModernButton';
import ModernInput from '../components/ModernInput';
import ModernSelect from '../components/ModernSelect';
import { api } from '../api';

const categories = [
  { value: 'FUEL', label: 'Fuel', icon: '⛽' },
  { value: 'MAINTENANCE', label: 'Maintenance', icon: '🔧' },
  { value: 'SALARY', label: 'Salary', icon: '💰' },
  { value: 'INSURANCE', label: 'Insurance', icon: '🛡️' },
  { value: 'TOLL', label: 'Toll', icon: '🛣️' },
  { value: 'PARKING', label: 'Parking', icon: '🅿️' },
  { value: 'REPAIR', label: 'Repair', icon: '🔨' },
  { value: 'OTHER', label: 'Other', icon: '📋' },
];

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PAID', label: 'Paid' },
  { value: 'REJECTED', label: 'Rejected' },
];

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

export default function EditExpense() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: '',
    status: 'PENDING',
    description: '',
  });

  useEffect(() => {
    fetchExpense();
  }, [id]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/expenses/${id}`);
      setFormData({
        title: response.title || '',
        amount: response.amount ? response.amount.toString() : '',
        category: response.category || '',
        date: response.date ? response.date.split('T')[0] : '',
        status: response.status || 'PENDING',
        description: response.description || '',
      });
    } catch (error) {
      alert('Failed to load expense details');
      console.error('Error fetching expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future';
      }
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      await api.put(`/expenses/${id}`, formData);
      alert('Expense updated successfully!');
      navigate(`/expenses/${id}`);
    } catch (error) {
      alert('Failed to update expense. Please try again.');
      console.error('Error updating expense:', error);
    } finally {
      setSaving(false);
    }
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.value === formData.category);
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

  return (
    <Layout>
      <div className="px-2 sm:px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Expense</h1>
                <p className="text-gray-600 mt-1">Update the expense details below</p>
              </div>
            </div>
            <ModernButton
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/expenses/${id}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Expense</span>
            </ModernButton>
          </div>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* 2-column grid for main fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ModernInput
                  label="Title"
                  value={formData.title}
                  onChange={e => handleChange('title', e.target.value)}
                  required
                  placeholder="Enter expense title"
                  icon={<List className="h-4 w-4" />}
                  error={errors.title}
                />
                <ModernSelect
                  label="Category"
                  value={formData.category}
                  onChange={e => handleChange('category', e.target.value)}
                  options={categories}
                  required
                  placeholder="Select category"
                  error={errors.category}
                />
                <ModernInput
                  label="Amount (₹)"
                  type="number"
                  value={formData.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                  required
                  placeholder="Enter amount"
                  icon={<IndianRupee className="h-4 w-4" />}
                  error={errors.amount}
                />
                <ModernInput
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={e => handleChange('date', e.target.value)}
                  required
                  icon={<Calendar className="h-4 w-4" />}
                  error={errors.date}
                />
                <ModernSelect
                  label="Status"
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                  options={statusOptions}
                  required
                  placeholder="Select status"
                  error={errors.status}
                />
              </div>

              {/* Category Preview */}
              {formData.category && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getSelectedCategory()?.icon}</span>
                    <div>
                      <p className="text-sm text-gray-600">Selected Category</p>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${categoryColors[formData.category] || 'bg-gray-100 text-gray-800'}`}>
                        {getSelectedCategory()?.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <ModernInput
                  label="Description (optional)"
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Add any notes, details, or context about this expense"
                  multiline
                  rows={3}
                />
              </div>

              {/* Form Summary */}
              {formData.title && formData.amount && formData.category && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Expense Summary</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Title</p>
                      <p className="text-blue-900">{formData.title}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Amount</p>
                      <p className="text-blue-900">₹{Number(formData.amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Category</p>
                      <p className="text-blue-900">{categories.find(c => c.value === formData.category)?.label}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Status</p>
                      <p className="text-blue-900">{statusOptions.find(s => s.value === formData.status)?.label}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Divider above buttons */}
              <div className="border-t border-gray-200 pt-6 flex justify-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-row items-center gap-2 justify-center w-36 h-10 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 whitespace-nowrap"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Expense</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/expenses/${id}`)}
                  className="w-36 h-10 px-4 rounded-lg border border-gray-300 bg-white text-blue-600 font-medium text-sm shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
} 