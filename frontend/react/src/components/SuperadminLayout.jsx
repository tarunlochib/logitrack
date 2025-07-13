import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const SuperadminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState("");
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        { name: 'Dashboard', href: '/superadmin', icon: '🏠' },
        { name: 'Transporters', href: '/superadmin/transporters', icon: '🏢' },
        { name: 'Users', href: '/superadmin/users', icon: '👥' },
        { name: 'Shipments', href: '/superadmin/shipments', icon: '📦' },
        { name: 'Analytics', href: '/superadmin/analytics', icon: '📊' },
        { name: 'Settings', href: '/superadmin/settings', icon: '⚙️' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const isActive = (href) => {
        return location.pathname === href;
    };

    // Search handler
    const handleSearch = (e) => {
        e.preventDefault();
        if (!search.trim()) return;
        // Simple logic: email => users, number => shipments, else users
        if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(search.trim())) {
            navigate(`/superadmin/users?search=${encodeURIComponent(search.trim())}`);
        } else if (/^\d+$/.test(search.trim())) {
            navigate(`/superadmin/shipments?search=${encodeURIComponent(search.trim())}`);
        } else {
            navigate(`/superadmin/users?search=${encodeURIComponent(search.trim())}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white/90 backdrop-blur-md shadow-xl">
                    <div className="flex h-16 items-center justify-between px-6 border-b border-gray-100">
                        <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Superadmin</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
                        >
                            <span className="sr-only">Close sidebar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <nav className="flex-1 space-y-2 px-4 py-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive(item.href)
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                                }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <span className={`mr-3 text-lg ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-white/80 backdrop-blur-md border-r border-gray-100 shadow-lg">
                    <div className="flex h-16 items-center px-6 border-b border-gray-100">
                        <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Superadmin</h1>
                    </div>
                    <nav className="flex-1 space-y-2 px-4 py-6">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                    isActive(item.href)
                                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                                }`}
                            >
                                <span className={`mr-3 text-lg ${isActive(item.href) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>{item.icon}</span>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-md border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center gap-x-4">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        {/* Modern pill-shaped search bar */}
                        <form className="flex-1 flex items-center" onSubmit={handleSearch}>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
                                placeholder="Search..."
                                className="w-full max-w-xs px-4 py-2 rounded-full border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 text-sm shadow-sm transition"
                            />
                            <button type="submit" className="ml-2 p-2 rounded-full hover:bg-gray-100 text-gray-500 text-base flex items-center justify-center transition" aria-label="Search">
                                <FaSearch />
                            </button>
                        </form>
                        <div className="flex items-center gap-x-2">
                            {/* Modern avatar */}
                            <div className="relative">
                                <span className="inline-block w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center font-bold text-lg shadow">
                                    {JSON.parse(localStorage.getItem('user'))?.name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            {/* Always visible logout button */}
                            <button
                                onClick={handleLogout}
                                className="ml-2 p-2 rounded-full hover:bg-red-50 text-red-500 transition flex items-center justify-center"
                                title="Logout"
                                aria-label="Logout"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SuperadminLayout; 