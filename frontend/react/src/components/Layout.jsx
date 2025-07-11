import { useState } from "react";
import Topbar from "./Topbar";
import Sidebar from "./sidebar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 min-w-0">
      {/* Sidebar (desktop & mobile overlay) */}
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 bg-gray-800 text-white fixed left-0 top-0 h-full z-20">
        <Sidebar />
      </div>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-40 z-30" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white z-40 transition-transform">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full lg:ml-64 min-w-0">
        {/* Topbar with sidebar toggle */}
        <div className="bg-white shadow z-10">
          <Topbar onSidebarToggle={() => setSidebarOpen(true)} />
        </div>
        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:px-0 lg:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}