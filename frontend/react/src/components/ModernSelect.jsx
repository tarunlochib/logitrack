import React from "react";

export default function ModernSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  error = "",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block mb-1 font-semibold text-gray-700">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 py-2 px-3 bg-white appearance-none ${
          error ? "border-red-500" : ""
        } transition-colors duration-150 outline-none`}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <div className="mt-1 text-sm text-red-600">{error}</div>}
    </div>
  );
} 