import React from "react";

export default function ModernContentCard({ children, className = "", ...props }) {
  return (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6 ${className}`} {...props}>
      {children}
    </div>
  );
} 