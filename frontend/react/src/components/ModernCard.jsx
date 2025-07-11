import React from "react";

export default function ModernCard({ icon, label, value, gradient = "from-blue-500 to-blue-300" }) {
  return (
    <div className={`bg-gradient-to-tr ${gradient} text-white rounded-2xl shadow-lg flex flex-col items-center justify-center py-6 px-4 h-full`}>
      <div className="mb-2">{icon}</div>
      <div className="text-lg font-semibold text-white text-center mb-1">{label}</div>
      <div className="text-xl md:text-2xl font-bold text-white text-center whitespace-nowrap">{value}</div>
    </div>
  );
} 