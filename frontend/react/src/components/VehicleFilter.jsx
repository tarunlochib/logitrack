import { useState } from "react";

const initialFilters = {
  number: "",
  model: "",
  capacity: "",
  status: "",
  driver: "",
};

export default function VehicleFilter({ onFilterChange }) {
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
    <div className="bg-gray-50 p-4 rounded-lg shadow flex flex-wrap gap-4 items-end mb-4">
      <div>
        <label className="block text-xs font-medium text-gray-700">Vehicle No</label>
        <input
          type="text"
          name="number"
          value={filters.number}
          onChange={handleChange}
          className="mt-1 block w-32 px-2 py-1 border border-gray-300 rounded"
          placeholder="Vehicle No"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Model</label>
        <input
          type="text"
          name="model"
          value={filters.model}
          onChange={handleChange}
          className="mt-1 block w-32 px-2 py-1 border border-gray-300 rounded"
          placeholder="Model"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Capacity</label>
        <input
          type="number"
          name="capacity"
          value={filters.capacity}
          onChange={handleChange}
          className="mt-1 block w-24 px-2 py-1 border border-gray-300 rounded"
          placeholder="Capacity"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={filters.status}
          onChange={handleChange}
          className="mt-1 block w-28 px-2 py-1 border border-gray-300 rounded"
        >
          <option value="">All</option>
          <option value="available">Available</option>
          <option value="inuse">In Use</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Driver</label>
        <input
          type="text"
          name="driver"
          value={filters.driver}
          onChange={handleChange}
          className="mt-1 block w-32 px-2 py-1 border border-gray-300 rounded"
          placeholder="Driver Name"
        />
      </div>
      <button
        type="button"
        onClick={handleReset}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded ml-2"
      >
        Reset
      </button>
    </div>
  );
} 