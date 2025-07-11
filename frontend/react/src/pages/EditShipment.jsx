import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from '../components/Layout';
import ModernInput from "../components/ModernInput";
import ModernSelect from "../components/ModernSelect";
import ModernButton from "../components/ModernButton";

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
    const token = localStorage.getItem("token");

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch drivers and vehicles
                const [driversResponse, vehiclesResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/with-user`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                setDrivers(driversResponse.data);
                setVehicles(vehiclesResponse.data);

                // Fetch shipment data
                const shipmentResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const shipment = shipmentResponse.data;
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
    }, [id, token]);

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
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments/${id}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            alert("Shipment updated successfully");
            navigate(`/shipments/${id}`);
        } catch (error) {
            if (
                error.response?.data?.message?.includes("Unique constraint failed") &&
                error.response?.data?.message?.includes("billNo")
            ) {
                alert("A shipment with this Bill Number already exists. Please use a unique Bill Number.");
            } else {
                alert("Failed to update shipment. Please try again.");
            }
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

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading shipment details...</span>
            </div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
                <button 
                    onClick={() => navigate("/shipments")}
                    className="ml-4 text-red-600 hover:text-red-800 underline"
                >
                    Back to Shipments
                </button>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-h-[calc(100vh-100px)] overflow-y-auto p-4 bg-white/80 border border-gray-100 rounded-2xl shadow-md">
                <h1 className="text-2xl font-bold mb-6">Edit Shipment</h1>
                <form onSubmit={handleSubmit} className="max-w-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {formFields.map((field) => (
                            <div key={field.name}>
                                <label className="block mb-1 font-semibold">
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
                                        type={field.type || "text"}
                                        value={formData[field.name]}
                                        onChange={handleChange}
                                        placeholder={field.label}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col md:flex-row gap-4">
                        <ModernButton
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={submitting}
                            className="w-full md:w-auto"
                        >
                            {submitting ? "Updating Shipment..." : "Update Shipment"}
                        </ModernButton>
                        <ModernButton
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => navigate(-1)}
                            className="w-full md:w-auto"
                        >
                            Cancel
                        </ModernButton>
                    </div>
                </form>
            </div>
        </Layout>
    );
} 