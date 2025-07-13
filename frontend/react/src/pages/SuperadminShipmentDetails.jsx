import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ModernButton from '../components/ModernButton';
import { FaEdit, FaDownload, FaArrowLeft } from 'react-icons/fa';
import { api } from '../api';

export default function SuperadminShipmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShipment = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/superadmin/shipments/${id}`);
        setShipment(res.data || res);
      } catch (err) {
        setError('Failed to load shipment details');
      } finally {
        setLoading(false);
      }
    };
    fetchShipment();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading shipment details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!shipment) return <div className="p-8 text-center text-gray-500">No shipment found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <ModernButton onClick={() => navigate(-1)} variant="secondary" className="flex items-center gap-2">
          <FaArrowLeft /> Back
        </ModernButton>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Shipment Details</h1>
        <ModernButton onClick={() => navigate(`/superadmin/shipments/${id}/edit`)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <FaEdit /> Edit
        </ModernButton>
        <ModernButton onClick={() => {}} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700">
          <FaDownload /> Download
        </ModernButton>
      </div>
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
            <div className="mb-1"><b>Shipment ID:</b> {shipment.id}</div>
            <div className="mb-1"><b>Bill Number:</b> {shipment.billNo || '—'}</div>
            <div className="mb-1"><b>Date:</b> {shipment.date ? new Date(shipment.date).toLocaleDateString() : '—'}</div>
            <div className="mb-1"><b>Status:</b> <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">{shipment.status}</span></div>
            <div className="mb-1"><b>Payment Method:</b> {shipment.paymentMethod || '—'}</div>
            <div className="mb-1"><b>Amount:</b> {shipment.grandTotal?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || '—'}</div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Transporter</h2>
            <div className="mb-1"><b>Name:</b> {shipment.tenant?.name || '—'}</div>
            <div className="mb-1"><b>ID:</b> {shipment.tenant?.id || '—'}</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Goods Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-1"><b>Source:</b> {shipment.source || '—'}</div>
            <div className="mb-1"><b>Destination:</b> {shipment.destination || '—'}</div>
            <div className="mb-1"><b>Weight:</b> {shipment.weight ? `${shipment.weight} kg` : '—'}</div>
          </div>
          <div>
            <div className="mb-1"><b>Goods Type:</b> {shipment.goodsType || '—'}</div>
            <div className="mb-1"><b>Description:</b> {shipment.goodsDescription || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 