import React from "react";

export default function ModernInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  icon,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block mb-1 font-semibold text-gray-700">{label}</label>}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-gray-400">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 py-2 px-3 ${
            icon ? "pl-10" : ""
          } ${error ? "border-red-500" : ""} transition-colors duration-150 outline-none`}
          {...props}
        />
      </div>
      {error && <div className="mt-1 text-sm text-red-600">{error}</div>}
    </div>
  );
} 