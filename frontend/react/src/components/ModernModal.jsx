import React, { useEffect } from "react";

export default function ModernModal({ open, onClose, title, children, actions, className = "" }) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6 animate-fade-in ${className}`}
        onClick={e => e.stopPropagation()}>
        {title && <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>}
        <div className="mb-4">{children}</div>
        {actions && <div className="flex justify-end gap-2 mt-4">{actions}</div>}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
} 