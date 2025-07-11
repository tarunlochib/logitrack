import React from "react";

const variantStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};
const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export default function ModernButton({
  children,
  onClick,
  variant = "primary",
  icon,
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg shadow-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-150 ${
        variantStyles[variant] || variantStyles.primary
      } ${sizeStyles[size] || sizeStyles.md} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
} 