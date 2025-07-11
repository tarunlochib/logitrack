import { useState } from "react";
import ModernInput from "./ModernInput";
import ModernSelect from "./ModernSelect";
import ModernButton from "./ModernButton";

const initialFilters = {
  billNo: "",
  consignor: "",
  consignee: "",
  fromDate: "",
  toDate: "",
  paymentMethod: "",
  status: "",
};

export default function ShipmentFilter({ onFilterChange }) {
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
            label="Bill No"
            name="billNo"
            value={filters.billNo}
            onChange={handleChange}
            placeholder="Bill No"
          />
        </div>
        <div className="w-32 min-w-[110px]">
          <ModernInput
            label="Consignor"
            name="consignor"
            value={filters.consignor}
            onChange={handleChange}
            placeholder="Consignor"
          />
        </div>
        <div className="w-32 min-w-[110px]">
          <ModernInput
            label="Consignee"
            name="consignee"
            value={filters.consignee}
            onChange={handleChange}
            placeholder="Consignee"
          />
        </div>
        <div className="w-36 min-w-[120px]">
          <ModernInput
            label="From Date"
            name="fromDate"
            type="date"
            value={filters.fromDate}
            onChange={handleChange}
          />
        </div>
        <div className="w-36 min-w-[120px]">
          <ModernInput
            label="To Date"
            name="toDate"
            type="date"
            value={filters.toDate}
            onChange={handleChange}
          />
        </div>
        <div className="w-40 min-w-[130px]">
          <ModernSelect
            label="Payment Method"
            name="paymentMethod"
            value={filters.paymentMethod}
            onChange={handleChange}
            options={[
              { value: "", label: "All" },
              { value: "PAID", label: "Paid" },
              { value: "TO_PAY", label: "To Pay" },
              { value: "TO_BE_BILLED", label: "To Be Billed" },
            ]}
          />
        </div>
        <div className="w-32 min-w-[110px]">
          <ModernSelect
            label="Status"
            name="status"
            value={filters.status}
            onChange={handleChange}
            options={[
              { value: "", label: "All" },
              { value: "PENDING", label: "Pending" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "COMPLETED", label: "Completed" },
              { value: "DELIVERED", label: "Delivered" },
            ]}
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