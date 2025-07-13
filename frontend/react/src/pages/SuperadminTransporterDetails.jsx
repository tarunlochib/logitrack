import React, { useEffect, useState } from 'react';
import ModernButton from '../components/ModernButton';
import { api } from '../api';
import { useNavigate, useParams } from 'react-router-dom';

export default function SuperadminTransporterDetails() {
  const { id } = useParams();
  const [transporter, setTransporter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransporter();
    // eslint-disable-next-line
  }, [id]);

  const fetchTransporter = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/superadmin/transporters/${id}`);
      setTransporter(res.data || res);
    } catch {
      setError('Failed to load transporter');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading transporter details...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }
  if (!transporter) {
    return <div className="p-8 text-center text-gray-600">Transporter not found</div>;
  }
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{transporter.name}</h1>
        <ModernButton variant="primary" onClick={() => navigate(`/superadmin/transporters/${id}/edit`)}>Edit</ModernButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-gray-500 text-sm">Name:</div>
          <div className="text-lg font-medium">{transporter.name}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">GST Number:</div>
          <div className="text-lg font-medium">{transporter.gstNumber || '-'}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">Domain:</div>
          <div className="text-lg font-medium">{transporter.domain || '-'}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">Status:</div>
          <div className={transporter.isActive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
            {transporter.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">Created At:</div>
          <div className="text-lg font-medium">{transporter.createdAt ? new Date(transporter.createdAt).toLocaleString() : '-'}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">Updated At:</div>
          <div className="text-lg font-medium">{transporter.updatedAt ? new Date(transporter.updatedAt).toLocaleString() : '-'}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <div>
          <div className="text-gray-500 text-sm">Users</div>
          <div className="text-lg font-medium">{transporter._count?.users ?? '-'}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">Vehicles</div>
          <div className="text-lg font-medium">{transporter._count?.vehicles ?? '-'}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">Drivers</div>
          <div className="text-lg font-medium">{transporter._count?.drivers ?? '-'}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">Shipments</div>
          <div className="text-lg font-medium">{transporter._count?.shipments ?? '-'}</div>
        </div>
      </div>
    </div>
  );
} 