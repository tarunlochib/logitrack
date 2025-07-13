import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import Layout from '../components/Layout';
import ModernInput from "../components/ModernInput";
import ModernSelect from "../components/ModernSelect";
import ModernButton from "../components/ModernButton";
import toast from 'react-hot-toast';

export default function EditShipment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        consigneeName: "",
        consignorName: "",
        consigneeAddress: "",
        consignorAddress: "",
        consigneeGstNo: "",
        consignorGstNo: "",
        date: "",
        billNo: "",
        transportName: "",
        goodsType: "",
        goodsDescription: "",
        weight: "",
        privateMark: "",
        paymentMethod: "",
        freightCharges: "",
        localCartageCharges: "",
        hamaliCharges: "",
        stationaryCharges: "",
        doorDeliveryCharges: "",
        otherCharges: "",
        source: "",
        destination: "",
        ewayBillNumber: "",
        driverId: "",
        vehicleId: "",
    });

    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch drivers and vehicles
                const [driversResponse, vehiclesResponse] = await Promise.all([
                    apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/with-user`),
                    apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles`),
                ]);

                setDrivers(await driversResponse.json());
                setVehicles(await vehiclesResponse.json());

                // Fetch shipment data
                const shipmentResponse = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${id}`);
                const shipment = await shipmentResponse.json();
                setFormData({
                    consigneeName: shipment.consigneeName,
                    consignorName: shipment.consignorName,
                    consigneeAddress: shipment.consigneeAddress,
                    consignorAddress: shipment.consignorAddress,
                    consigneeGstNo: shipment.consigneeGstNo,
                    consignorGstNo: shipment.consignorGstNo,
                    date: shipment.date.split('T')[0], // Convert to YYYY-MM-DD format
                    billNo: shipment.billNo,
                    transportName: shipment.transportName,
                    goodsType: shipment.goodsType,
                    goodsDescription: shipment.goodsDescription,
                    weight: shipment.weight.toString(),
                    privateMark: shipment.privateMark || "",
                    paymentMethod: shipment.paymentMethod,
                    freightCharges: shipment.freightCharges.toString(),
                    localCartageCharges: shipment.localCartageCharges.toString(),
                    hamaliCharges: shipment.hamaliCharges.toString(),
                    stationaryCharges: shipment.stationaryCharges.toString(),
                    doorDeliveryCharges: shipment.doorDeliveryCharges.toString(),
                    otherCharges: shipment.otherCharges.toString(),
                    source: shipment.source,
                    destination: shipment.destination,
                    ewayBillNumber: shipment.ewayBillNumber || "",
                    driverId: shipment.driverId ? shipment.driverId.toString() : "",
                    vehicleId: shipment.vehicleId ? shipment.vehicleId.toString() : "",
                });
            } catch (error) {
                console.error("❌ Error fetching data:", error);
                setError("Failed to load shipment details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const calculateGrandTotal = () => {
        const {
            freightCharges,
            localCartageCharges,
            hamaliCharges,
            stationaryCharges,
            doorDeliveryCharges,
            otherCharges,
        } = formData;
        return (
            Number(freightCharges || 0) +
            Number(localCartageCharges || 0) +
            Number(hamaliCharges || 0) +
            Number(stationaryCharges || 0) +
            Number(doorDeliveryCharges || 0) +
            Number(otherCharges || 0)
        ).toFixed(2);
    };

    const validateForm = () => {
        const requiredFields = [
            "consigneeName",
            "consignorName",
            "consigneeAddress",
            "consignorAddress",
            "consigneeGstNo",
            "consignorGstNo",
            "date",
            "billNo",
            "transportName",
            "goodsType",
            "goodsDescription",
            "weight",
            "paymentMethod",
            "source",
            "destination",
        ];

        for (const field of requiredFields) {
            if (!formData[field]) {
                toast.error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
                return false;
            }
        }

        if (Number(formData.weight) <= 0) {
            toast.error("Weight must be greater than 0.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        const grandTotal = calculateGrandTotal();

        const payload = {
            consigneeName: formData.consigneeName,
            consignorName: formData.consignorName,
            consigneeAddress: formData.consigneeAddress,
            consignorAddress: formData.consignorAddress,
            consigneeGstNo: formData.consigneeGstNo,
            consignorGstNo: formData.consignorGstNo,
            date: formData.date,
            billNo: formData.billNo,
            transportName: formData.transportName,
            goodsType: formData.goodsType,
            goodsDescription: formData.goodsDescription,
            weight: Number(formData.weight),
            privateMark: formData.privateMark || null,
            paymentMethod: formData.paymentMethod,
            freightCharges: Number(formData.freightCharges || 0),
            localCartageCharges: Number(formData.localCartageCharges || 0),
            hamaliCharges: Number(formData.hamaliCharges || 0),
            stationaryCharges: Number(formData.stationaryCharges || 0),
            doorDeliveryCharges: Number(formData.doorDeliveryCharges || 0),
            otherCharges: Number(formData.otherCharges || 0),
            grandTotal: Number(grandTotal),
            source: formData.source,
            destination: formData.destination,
            ewayBillNumber: formData.ewayBillNumber || null,
            driverId: formData.driverId || null,
            vehicleId: formData.vehicleId || null,
        };

        try {
            await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });

            toast.success("Shipment updated successfully");
            navigate(`/shipments/${id}`);
        } catch (error) {
            toast.error("Failed to update shipment. Please try again.");
            console.error("Error updating shipment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const formFields = [
        { name: "billNo", label: "Bill Number", required: true },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "transportName", label: "Transport Name", required: true },
        { name: "consignorName", label: "Consignor Name", required: true },
        { name: "consignorAddress", label: "Consignor Address", required: true },
        { name: "consignorGstNo", label: "Consignor GST No.", required: true },
        { name: "consigneeName", label: "Consignee Name", required: true },
        { name: "consigneeAddress", label: "Consignee Address", required: true },
        { name: "consigneeGstNo", label: "Consignee GST No.", required: true },
        {
            name: "goodsType",
            label: "Type of Goods",
            type: "select",
            options: ["BOX", "NAGS", "CARTONS", "BAGS", "PALLETS", "ROLLS", "OTHER"],
            required: true,
        },
        { name: "goodsDescription", label: "Description of Goods", required: true },
        { name: "weight", label: "Weight in Kg", type: "number", required: true },
        { name: "privateMark", label: "Private Mark" },
        {
            name: "paymentMethod",
            label: "Payment Method",
            type: "select",
            options: ["TO_PAY", "PAID", "TO_BE_BILLED"],
            required: true,
        },
        { name: "freightCharges", label: "Freight Charges", type: "number" },
        { name: "localCartageCharges", label: "Local Cartage Charges", type: "number" },
        { name: "hamaliCharges", label: "Hamali Charges", type: "number" },
        { name: "stationaryCharges", label: "Stationary Charges", type: "number" },
        { name: "doorDeliveryCharges", label: "Door Delivery Charges", type: "number" },
        { name: "otherCharges", label: "Other Charges", type: "number" },
        { name: "source", label: "Source Location", required: true },
        { name: "destination", label: "Destination Location", required: true },
        { name: "ewayBillNumber", label: "E-Way Bill Number" },
        {
            name: "driverId",
            label: "Driver",
            type: "select",
            options: drivers.map(driver => ({ value: driver.id, label: `${driver.user?.name || ''} (${driver.user?.phone || ''})` })),
        },
        {
            name: "vehicleId",
            label: "Vehicle",
            type: "select",
            options: vehicles.map(vehicle => ({ value: vehicle.id, label: `${vehicle.number} - ${vehicle.model}` })),
        },
    ];

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600 text-lg">Loading shipment details...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                            <div className="text-center py-12">
                                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl mb-6">
                                    <div className="flex items-center justify-center mb-2">
                                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-semibold">Error Loading Shipment</span>
                                    </div>
                                    <p>{error}</p>
                                </div>
                                <ModernButton
                                    variant="secondary"
                                    size="md"
                                    onClick={() => navigate("/shipments")}
                                    className="flex items-center space-x-2 mx-auto"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    <span>Back to Shipments</span>
                                </ModernButton>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Modern Header */}
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Edit Shipment</h1>
                                <p className="text-gray-600 mt-1">Update shipment information and details</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
                        <form onSubmit={handleSubmit}>
                            {/* Basic Information Section */}
                            <div className="mb-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {formFields.slice(0, 3).map((field) => (
                                        <div key={field.name}>
                                            <label className="block mb-2 font-medium text-gray-700">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {field.type === "select" ? (
                                                <ModernSelect
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    options={
                                                        field.options && field.options.length && typeof field.options[0] === "object"
                                                            ? field.options
                                                            : field.options?.map(opt => ({ value: opt, label: opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
                                                    }
                                                    placeholder={`Select ${field.label}`}
                                                />
                                            ) : (
                                                <ModernInput
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    type={field.type || "text"}
                                                    required={field.required}
                                                    placeholder={field.label}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Consignor Information Section */}
                            <div className="mb-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Consignor Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {formFields.slice(3, 6).map((field) => (
                                        <div key={field.name} className={field.name === "consignorAddress" ? "md:col-span-2" : ""}>
                                            <label className="block mb-2 font-medium text-gray-700">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            <ModernInput
                                                name={field.name}
                                                value={formData[field.name]}
                                                onChange={handleChange}
                                                type={field.type || "text"}
                                                required={field.required}
                                                placeholder={field.label}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Consignee Information Section */}
                            <div className="mb-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Consignee Details</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {formFields.slice(6, 9).map((field) => (
                                        <div key={field.name} className={field.name === "consigneeAddress" ? "md:col-span-2" : ""}>
                                            <label className="block mb-2 font-medium text-gray-700">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            <ModernInput
                                                name={field.name}
                                                value={formData[field.name]}
                                                onChange={handleChange}
                                                type={field.type || "text"}
                                                required={field.required}
                                                placeholder={field.label}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Goods Information Section */}
                            <div className="mb-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Goods Information</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {formFields.slice(9, 13).map((field) => (
                                        <div key={field.name} className={field.name === "goodsDescription" ? "md:col-span-2" : ""}>
                                            <label className="block mb-2 font-medium text-gray-700">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {field.type === "select" ? (
                                                <ModernSelect
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    options={
                                                        field.options && field.options.length && typeof field.options[0] === "object"
                                                            ? field.options
                                                            : field.options?.map(opt => ({ value: opt, label: opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
                                                    }
                                                    placeholder={`Select ${field.label}`}
                                                />
                                            ) : (
                                                <ModernInput
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    type={field.type || "text"}
                                                    required={field.required}
                                                    placeholder={field.label}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Charges Section */}
                            <div className="mb-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Charges & Payment</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {formFields.slice(13, 20).map((field) => (
                                        <div key={field.name}>
                                            <label className="block mb-2 font-medium text-gray-700">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {field.type === "select" ? (
                                                <ModernSelect
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    options={
                                                        field.options && field.options.length && typeof field.options[0] === "object"
                                                            ? field.options
                                                            : field.options?.map(opt => ({ value: opt, label: opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
                                                    }
                                                    placeholder={`Select ${field.label}`}
                                                />
                                            ) : (
                                                <ModernInput
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    type={field.type || "text"}
                                                    required={field.required}
                                                    placeholder={field.label}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Location & Assignment Section */}
                            <div className="mb-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">Location & Assignment</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {formFields.slice(20).map((field) => (
                                        <div key={field.name}>
                                            <label className="block mb-2 font-medium text-gray-700">
                                                {field.label}
                                                {field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {field.type === "select" ? (
                                                <ModernSelect
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    options={
                                                        field.options && field.options.length && typeof field.options[0] === "object"
                                                            ? field.options
                                                            : field.options?.map(opt => ({ value: opt, label: opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }))
                                                    }
                                                    placeholder={`Select ${field.label}`}
                                                />
                                            ) : (
                                                <ModernInput
                                                    name={field.name}
                                                    value={formData[field.name]}
                                                    onChange={handleChange}
                                                    type={field.type || "text"}
                                                    required={field.required}
                                                    placeholder={field.label}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Grand Total Display */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <span className="text-lg font-semibold text-gray-800">Grand Total</span>
                                    </div>
                                    <span className="text-3xl font-bold text-green-700">₹{calculateGrandTotal()}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                <ModernButton
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => navigate('/shipments')}
                                    className="flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Cancel</span>
                                </ModernButton>
                                <ModernButton
                                    type="submit"
                                    variant="primary"
                                    size="sm"
                                    disabled={submitting}
                                    className="flex items-center space-x-2"
                                >
                                    {submitting ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Update Shipment</span>
                                        </>
                                    )}
                                </ModernButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
} 