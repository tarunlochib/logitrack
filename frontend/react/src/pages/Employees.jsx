import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  MoreVertical
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

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const actionButtonRefs = useRef({});
  const navigate = useNavigate();

  const roles = [
    { value: '', label: 'All Roles' },
    { value: 'DRIVER', label: 'Driver' },
    { value: 'HELPER', label: 'Helper' },
    { value: 'MECHANIC', label: 'Mechanic' },
    { value: 'ADMIN', label: 'Admin' },
    { value: 'ACCOUNTANT', label: 'Accountant' }
  ];

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm, roleFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: 1,
        limit: 1000,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter })
      });

      const response = await api.get(`/employees?${params}`);
      setEmployees(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, employeeId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${employeeId}`);
        alert('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  const handleRowClick = (employeeId) => {
    navigate(`/employees/${employeeId}`);
  };

  const getEmployeeStats = () => {
    const total = employees.length;
    const drivers = employees.filter(e => e.role === 'DRIVER').length;
    const helpers = employees.filter(e => e.role === 'HELPER').length;
    const totalSalary = employees.reduce((sum, e) => sum + Number(e.salary), 0);
    return { total, drivers, helpers, totalSalary };
  };

  const stats = getEmployeeStats();

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        employee.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || employee.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <Layout>
      <div className="px-2 sm:px-4 md:px-6 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
              <p className="text-gray-600">Manage your company employees and their information</p>
            </div>
            <ModernButton 
              onClick={() => navigate("/employees/new")}
              variant="primary"
              className="flex items-center justify-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Employee
            </ModernButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.drivers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <User className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Helpers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.helpers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <IndianRupee className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Salary</p>
                <p className="text-2xl font-bold text-gray-900">{formatIndianAmount(stats.totalSalary)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search employees by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading employees...</p>
            </div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Employees Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || roleFilter 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first employee."
                }
              </p>
              <ModernButton 
                onClick={() => navigate("/employees/new")}
                variant="primary"
                className="w-full justify-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Employee
              </ModernButton>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">All Employees</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joining Date</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-blue-50/60 cursor-pointer group transition"
                      onClick={() => handleRowClick(employee.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{employee.name}</p>
                            <p className="text-sm text-gray-500">{employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge 
                          status={employee.role} 
                          type="completed"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{employee.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <IndianRupee className="w-4 h-4 text-green-500" />
                          <span className="text-gray-900">{formatIndianAmount(employee.salary)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">
                            {employee.dateOfJoining && !isNaN(new Date(employee.dateOfJoining).getTime())
                              ? new Date(employee.dateOfJoining).toLocaleDateString('en-IN')
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center relative" onClick={e => e.stopPropagation()}>
                        <button
                          ref={el => (actionButtonRefs.current[employee.id] = el)}
                          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none"
                          onClick={() => setActionMenuOpen(actionMenuOpen === employee.id ? null : employee.id)}
                          aria-label="Actions"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                        <PortalDropdown
                          anchorRef={{ current: actionButtonRefs.current[employee.id] }}
                          open={actionMenuOpen === employee.id}
                          onClose={() => setActionMenuOpen(null)}
                        >
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-cyan-700 hover:bg-cyan-50 text-sm font-medium rounded-t-xl"
                            onClick={() => { setActionMenuOpen(null); navigate(`/employees/${employee.id}`); }}
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-yellow-700 hover:bg-yellow-50 text-sm font-medium"
                            onClick={() => { setActionMenuOpen(null); navigate(`/employees/${employee.id}/edit`); }}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium rounded-b-xl"
                            onClick={e => { setActionMenuOpen(null); handleDelete(e, employee.id); }}
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

export default Employees; 