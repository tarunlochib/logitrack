import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { api } from '../api';

const TransporterDetails = () => {
    const { id } = useParams();
    const [transporter, setTransporter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransporterDetails();
    }, [id]);

    const fetchTransporterDetails = async () => {
        try {
            const response = await api.get(`/superadmin/transporters/${id}`);
            setTransporter(response.data);
        } catch (error) {
            console.error('Error fetching transporter details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading transporter details...</p>
                </div>
            </div>
        );
    }

    if (!transporter) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Transporter Not Found</h2>
                    <Link to="/superadmin" className="text-blue-600 hover:text-blue-800">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{transporter.name}</h1>
                    <p className="text-gray-600">Transporter Details</p>
                </div>
                <Link to="/superadmin">
                    <ModernButton className="bg-gray-600 hover:bg-gray-700">
                        Back to Dashboard
                    </ModernButton>
                </Link>
            </div>

            {/* Basic Info */}
            <ModernCard>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="mt-1 text-sm text-gray-900">{transporter.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug</label>
                        <p className="mt-1 text-sm text-gray-900">{transporter.slug}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Domain</label>
                        <p className="mt-1 text-sm text-gray-900">{transporter.domain || 'Not set'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                            transporter.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {transporter.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Created</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {new Date(transporter.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {new Date(transporter.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </ModernCard>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <ModernCard>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{transporter._count.users}</div>
                        <div className="text-gray-600">Users</div>
                    </div>
                </ModernCard>
                <ModernCard>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{transporter._count.vehicles}</div>
                        <div className="text-gray-600">Vehicles</div>
                    </div>
                </ModernCard>
                <ModernCard>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{transporter._count.drivers}</div>
                        <div className="text-gray-600">Drivers</div>
                    </div>
                </ModernCard>
                <ModernCard>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{transporter._count.shipments}</div>
                        <div className="text-gray-600">Shipments</div>
                    </div>
                </ModernCard>
            </div>

            {/* Users */}
            <ModernCard>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Users</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transporter.users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'DISPATCHER' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ModernCard>

            {/* Vehicles */}
            <ModernCard>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicles</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Model
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transporter.vehicles.map((vehicle) => (
                                <tr key={vehicle.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {vehicle.number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {vehicle.model}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            vehicle.isAvailable 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ModernCard>

            {/* Drivers */}
            <ModernCard>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Drivers</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    License Number
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transporter.drivers.map((driver) => (
                                <tr key={driver.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {driver.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {driver.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {driver.licenseNumber}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ModernCard>

            {/* Recent Shipments */}
            <ModernCard>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Shipments</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bill No
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transporter.shipments.slice(0, 10).map((shipment) => (
                                <tr key={shipment.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {shipment.billNo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            shipment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                            shipment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                            shipment.status === 'DELIVERED' ? 'bg-purple-100 text-purple-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {shipment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(shipment.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </ModernCard>
        </div>
    );
};

export default TransporterDetails; 