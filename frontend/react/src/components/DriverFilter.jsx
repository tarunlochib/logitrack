import { useState } from "react";
import ModernInput from "./ModernInput";
import ModernButton from "./ModernButton";

const initialFilters = {
  name: "",
  phone: "",
  licenseNumber: "",
  vehicle: "",
};

export default function DriverFilter({ onFilterChange }) {
  const [filters, setFilters] = useState(initialFilters);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updated = { ...prev, [name]: value };
      onFilterChange(updated);
      return updated;
    });
  };

  const handleReset = () => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  };

  return (
    <div className="bg-white/80 border border-gray-100 rounded-2xl shadow-md px-6 py-4 mb-6">
      <form className="flex flex-wrap gap-4 items-end">
        <div className="w-32 min-w-[110px]">
          <ModernInput
            label="Name"
            name="name"
            value={filters.name}
            onChange={handleChange}
            placeholder="Name"
          />
        </div>
        <div className="w-32 min-w-[110px]">
          <ModernInput
            label="Phone"
            name="phone"
            value={filters.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
        </div>
        <div className="w-32 min-w-[110px]">
          <ModernInput
            label="License No"
            name="licenseNumber"
            value={filters.licenseNumber}
            onChange={handleChange}
            placeholder="License No"
          />
        </div>
        <div className="w-32 min-w-[110px]">
          <ModernInput
            label="Vehicle"
            name="vehicle"
            value={filters.vehicle}
            onChange={handleChange}
            placeholder="Vehicle No"
          />
        </div>
        <div className="flex-1 min-w-[80px] flex justify-end">
          <ModernButton
            type="button"
            onClick={handleReset}
            variant="secondary"
            size="sm"
          >
            Reset
          </ModernButton>
        </div>
      </form>
    </div>
  );
} 