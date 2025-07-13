import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import Layout from "../components/Layout";
import ModernInput from "../components/ModernInput";
import ModernSelect from "../components/ModernSelect";
import ModernButton from "../components/ModernButton";

export default function AddUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "DISPATCHER",
    licenseNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to create user");
      setSuccess("User created successfully!");
      setFormData({ name: "", email: "", phone: "", password: "", role: "DISPATCHER", licenseNumber: "" });
    } catch (err) {
      setError(err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow border mt-8">
        <h2 className="text-2xl font-bold mb-4">Create Tenant User</h2>
        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-3">{error}</div>}
        {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-3">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <ModernInput name="name" label="Name" value={formData.name} onChange={handleChange} required />
          <ModernInput name="email" label="Email" value={formData.email} onChange={handleChange} required />
          <ModernInput name="phone" label="Phone" value={formData.phone} onChange={handleChange} required />
          <ModernInput name="password" label="Password" value={formData.password} onChange={handleChange} required type="password" />
          <ModernSelect
            name="role"
            label="Role"
            value={formData.role}
            onChange={handleChange}
            options={[
              { value: "DISPATCHER", label: "Dispatcher" },
              { value: "DRIVER", label: "Driver" },
            ]}
          />
          {formData.role === "DRIVER" && (
            <ModernInput 
              name="licenseNumber" 
              label="License Number" 
              value={formData.licenseNumber} 
              onChange={handleChange} 
              required 
              placeholder="Enter driver's license number"
            />
          )}
          <ModernButton type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create User"}
          </ModernButton>
        </form>
      </div>
    </Layout>
  );
} 