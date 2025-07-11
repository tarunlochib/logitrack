import React from "react";

const statusColors = {
  completed: "bg-green-100 text-green-800",
  delivered: "bg-green-100 text-green-800",
  paid: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  to_pay: "bg-yellow-100 text-yellow-800",
  to_be_billed: "bg-blue-100 text-blue-800",
  default: "bg-blue-100 text-blue-800"
};

export default function StatusBadge({ status = "", type }) {
  const normalized = status.toLowerCase().replace(/ /g, "_");
  const color = type
    ? statusColors[type] || statusColors.default
    : statusColors[normalized] || statusColors.default;
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${color}`}>{status}</span>
  );
} 