import React from "react";

export default function SearchInput({ value, onChange, placeholder = "Search...", className = "" }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="absolute left-3 text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-3.5-3.5" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-900 bg-white"
      />
      {value && (
        <button
          type="button"
          className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={() => onChange({ target: { value: "" } })}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
} 