import React from "react";

export default function ModernTable({ columns, data, headerGradient = "from-blue-100 to-green-100", renderCell, actions, onRowClick }) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-xs">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || col.label}
                  className={`px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap ${col.className || ""}`.trim()}
                >
                  {col.label}
                </th>
              ))}
              {actions && <th className="px-3 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={row.id || rowIdx}
                className={`hover:bg-gray-100 transition-colors duration-150 ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`px-3 py-2 whitespace-nowrap truncate max-w-[120px] ${col.className || ""}`.trim()}
                  >
                    {renderCell ? renderCell(row, col, rowIdx, colIdx) : row[col.key]}
                  </td>
                ))}
                {actions && <td className="px-3 py-2 whitespace-nowrap">{actions(row, rowIdx)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 