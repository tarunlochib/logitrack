import { useState, useEffect } from "react";
import { apiFetch } from "../api";
import Layout from '../components/Layout';
import { useNavigate } from "react-router-dom";
import ModernInput from "../components/ModernInput";
import ModernSelect from "../components/ModernSelect";
import ModernButton from "../components/ModernButton";

export default function AddShipment() {
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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch drivers and vehicles on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driversResponse, vehiclesResponse] = await Promise.all([
          apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/with-user`),
          apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles`),
        ]);
        setDrivers(await driversResponse.json());
        setVehicles(await vehiclesResponse.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return false;
      }
    }

    if (Number(formData.weight) <= 0) {
      alert("Weight must be greater than 0.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const grandTotal = calculateGrandTotal();

    // Prepare payload with correct types according to Prisma schema
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
      await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      alert("Shipment added successfully");
      navigate("/shipments");
    } catch (error) {
      alert("Failed to add shipment. Please try again.");
      console.error("Error adding shipment:", error);
    } finally {
      setLoading(false);
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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Create New Shipment</h1>
                  <p className="text-gray-600 mt-1">Add a new shipment with complete details</p>
                </div>
              </div>
              <ModernButton
                variant="secondary"
                size="sm"
                onClick={() => navigate("/shipments")}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Shipments</span>
              </ModernButton>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl shadow-xl p-8">
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ModernInput
                      name="billNo"
                      label="Bill Number"
                      value={formData.billNo}
                      onChange={handleChange}
                      required
                      placeholder="Enter bill number"
                    />
                    <ModernInput
                      name="date"
                      label="Date"
                      type="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                    <ModernInput
                      name="transportName"
                      label="Transport Name"
                      value={formData.transportName}
                      onChange={handleChange}
                      required
                      placeholder="Enter transport name"
                    />
                  </div>
                </div>

                {/* Consignor Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Consignor Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModernInput
                      name="consignorName"
                      label="Consignor Name"
                      value={formData.consignorName}
                      onChange={handleChange}
                      required
                      placeholder="Enter consignor name"
                    />
                    <ModernInput
                      name="consignorGstNo"
                      label="Consignor GST No."
                      value={formData.consignorGstNo}
                      onChange={handleChange}
                      required
                      placeholder="Enter GST number"
                    />
                    <div className="md:col-span-2">
                      <ModernInput
                        name="consignorAddress"
                        label="Consignor Address"
                        value={formData.consignorAddress}
                        onChange={handleChange}
                        required
                        placeholder="Enter complete address"
                      />
                    </div>
                  </div>
                </div>

                {/* Consignee Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Consignee Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModernInput
                      name="consigneeName"
                      label="Consignee Name"
                      value={formData.consigneeName}
                      onChange={handleChange}
                      required
                      placeholder="Enter consignee name"
                    />
                    <ModernInput
                      name="consigneeGstNo"
                      label="Consignee GST No."
                      value={formData.consigneeGstNo}
                      onChange={handleChange}
                      required
                      placeholder="Enter GST number"
                    />
                    <div className="md:col-span-2">
                      <ModernInput
                        name="consigneeAddress"
                        label="Consignee Address"
                        value={formData.consigneeAddress}
                        onChange={handleChange}
                        required
                        placeholder="Enter complete address"
                      />
                    </div>
                  </div>
                </div>

                {/* Goods Information */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Goods Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ModernSelect
                      name="goodsType"
                      label="Type of Goods"
                      value={formData.goodsType}
                      onChange={handleChange}
                      options={["BOX", "NAGS", "CARTONS", "BAGS", "PALLETS", "ROLLS", "OTHER"].map(opt => ({ 
                        value: opt, 
                        label: opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
                      }))}
                      required
                      placeholder="Select goods type"
                    />
                    <ModernInput
                      name="weight"
                      label="Weight in Kg"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      required
                      placeholder="Enter weight"
                    />
                    <ModernInput
                      name="privateMark"
                      label="Private Mark"
                      value={formData.privateMark}
                      onChange={handleChange}
                      placeholder="Enter private mark (optional)"
                    />
                    <div className="md:col-span-2 lg:col-span-3">
                      <ModernInput
                        name="goodsDescription"
                        label="Description of Goods"
                        value={formData.goodsDescription}
                        onChange={handleChange}
                        required
                        placeholder="Enter detailed description"
                      />
                    </div>
                  </div>
                </div>

                {/* Route Information */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Route Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModernInput
                      name="source"
                      label="Source Location"
                      value={formData.source}
                      onChange={handleChange}
                      required
                      placeholder="Enter source location"
                    />
                    <ModernInput
                      name="destination"
                      label="Destination Location"
                      value={formData.destination}
                      onChange={handleChange}
                      required
                      placeholder="Enter destination location"
                    />
                    <ModernInput
                      name="ewayBillNumber"
                      label="E-Way Bill Number"
                      value={formData.ewayBillNumber}
                      onChange={handleChange}
                      placeholder="Enter e-way bill number (optional)"
                    />
                  </div>
                </div>

                {/* Charges Information */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-2xl border border-yellow-100 mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Charges & Payment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ModernSelect
                      name="paymentMethod"
                      label="Payment Method"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      options={["TO_PAY", "PAID", "TO_BE_BILLED"].map(opt => ({ 
                        value: opt, 
                        label: opt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
                      }))}
                      required
                      placeholder="Select payment method"
                    />
                    <ModernInput
                      name="freightCharges"
                      label="Freight Charges"
                      type="number"
                      value={formData.freightCharges}
                      onChange={handleChange}
                      placeholder="Enter freight charges"
                    />
                    <ModernInput
                      name="localCartageCharges"
                      label="Local Cartage Charges"
                      type="number"
                      value={formData.localCartageCharges}
                      onChange={handleChange}
                      placeholder="Enter cartage charges"
                    />
                    <ModernInput
                      name="hamaliCharges"
                      label="Hamali Charges"
                      type="number"
                      value={formData.hamaliCharges}
                      onChange={handleChange}
                      placeholder="Enter hamali charges"
                    />
                    <ModernInput
                      name="stationaryCharges"
                      label="Stationary Charges"
                      type="number"
                      value={formData.stationaryCharges}
                      onChange={handleChange}
                      placeholder="Enter stationary charges"
                    />
                    <ModernInput
                      name="doorDeliveryCharges"
                      label="Door Delivery Charges"
                      type="number"
                      value={formData.doorDeliveryCharges}
                      onChange={handleChange}
                      placeholder="Enter delivery charges"
                    />
                    <ModernInput
                      name="otherCharges"
                      label="Other Charges"
                      type="number"
                      value={formData.otherCharges}
                      onChange={handleChange}
                      placeholder="Enter other charges"
                    />
                  </div>
                  
                  {/* Grand Total Display */}
                  <div className="mt-6 p-4 bg-white rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-800">Grand Total:</span>
                      <span className="text-2xl font-bold text-green-700">₹{calculateGrandTotal()}</span>
                    </div>
                  </div>
                </div>

                {/* Assignment Information */}
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border border-teal-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 text-teal-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Assignment (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ModernSelect
                      name="driverId"
                      label="Assign Driver"
                      value={formData.driverId}
                      onChange={handleChange}
                      options={drivers.map(driver => ({ 
                        value: driver.id, 
                        label: `${driver.user?.name || ''} (${driver.user?.phone || ''})` 
                      }))}
                      placeholder="Select driver (optional)"
                    />
                    <ModernSelect
                      name="vehicleId"
                      label="Assign Vehicle"
                      value={formData.vehicleId}
                      onChange={handleChange}
                      options={vehicles.map(vehicle => ({ 
                        value: vehicle.id, 
                        label: `${vehicle.number} - ${vehicle.model}` 
                      }))}
                      placeholder="Select vehicle (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <ModernButton
                  type="button"
                  variant="secondary"
                  size="md"
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
                  size="md"
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving Shipment...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Shipment</span>
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