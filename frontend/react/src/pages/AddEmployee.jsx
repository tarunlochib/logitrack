import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, DollarSign, CreditCard } from 'lucide-react';
import Layout from '../components/Layout';
import ModernButton from '../components/ModernButton';
import ModernInput from '../components/ModernInput';
import ModernSelect from '../components/ModernSelect';
import { api } from '../api';

const AddEmployee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    salary: '',
    aadharNumber: '',
    address: '',
    dateOfJoining: ''
  });

  const roles = [
    { value: 'DRIVER', label: 'Driver' },
    { value: 'HELPER', label: 'Helper' },
    { value: 'MECHANIC', label: 'Mechanic' },
    { value: 'MANAGER', label: 'Manager' },
    { value: 'ACCOUNTANT', label: 'Accountant' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('Submitting formData:', formData); // Debug salary value
    try {
      await api.post('/employees', formData);
      alert('Employee added successfully!');
      navigate('/employees');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Add New Employee</h1>
                  <p className="text-gray-600 mt-1">Enter the employee information below</p>
                </div>
              </div>
              <ModernButton
                variant="secondary"
                size="sm"
                onClick={() => navigate('/employees')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Employees</span>
              </ModernButton>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModernInput
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      placeholder="Enter full name"
                    />
                    <ModernInput
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      placeholder="Enter email address"
                    />
                    <ModernInput
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                      placeholder="Enter phone number"
                    />
                    <ModernInput
                      label="Aadhar Number"
                      value={formData.aadharNumber}
                      onChange={(e) => handleChange('aadharNumber', e.target.value)}
                      required
                      placeholder="Enter Aadhar number"
                    />
                  </div>
                </div>

                {/* Employment Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    Employment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ModernSelect
                      label="Role"
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      options={roles}
                      required
                      placeholder="Select role"
                    />
                    <ModernInput
                      label="Salary (₹)"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => handleChange('salary', e.target.value)}
                      required
                      placeholder="Enter salary amount"
                    />
                    <ModernInput
                      label="Joining Date"
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={(e) => handleChange('dateOfJoining', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 text-purple-600 mr-2" />
                    Address Information
                  </h3>
                  <ModernInput
                    label="Address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                    placeholder="Enter complete address"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <ModernButton
                  type="submit"
                  loading={loading}
                  className="flex-1 justify-center"
                >
                  Add Employee
                </ModernButton>
                <ModernButton
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/employees')}
                  className="flex-1 justify-center"
                >
                  Cancel
                </ModernButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddEmployee; 