import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaBox, FaUser, FaTruck, FaBuilding, FaMoneyBillWave } from 'react-icons/fa';
import { apiFetch } from "../api";

export default function Topbar({ onSidebarToggle }) {
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const resultsRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    const handleProfile = () => {
        navigate("/profile");
    };

    const handleAccountSettings = () => {
        navigate("/account-settings");
    };

    // Global search handler
    const handleGlobalSearch = async (searchTerm) => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        setShowResults(true);

        try {
            const results = [];
            
            // Search shipments
            try {
                const shipmentResponse = await apiFetch(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/shipments?search=${encodeURIComponent(searchTerm)}&pageSize=3`
                );
                const shipmentData = await shipmentResponse.json();
                if (shipmentData.shipments && shipmentData.shipments.length > 0) {
                    results.push({
                        type: 'shipments',
                        label: 'Shipments',
                        icon: <FaBox className="w-4 h-4" />,
                        items: shipmentData.shipments.map(s => ({
                            id: s.id,
                            title: `Bill #${s.billNo}`,
                            subtitle: `${s.consignorName} → ${s.consigneeName}`,
                            amount: s.grandTotal,
                            status: s.status
                        }))
                    });
                }
            } catch (error) {
                console.error('Error searching shipments:', error);
            }

            // Search drivers (if user has access)
            if (user?.role !== 'DRIVER') {
                try {
                    const driverResponse = await apiFetch(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/drivers/with-user?search=${encodeURIComponent(searchTerm)}&pageSize=3`
                    );
                    const driverData = await driverResponse.json();
                    if (driverData && driverData.length > 0) {
                        results.push({
                            type: 'drivers',
                            label: 'Drivers',
                            icon: <FaUser className="w-4 h-4" />,
                            items: driverData.map(d => ({
                                id: d.id,
                                title: d.user?.name || 'Unknown Driver',
                                subtitle: d.user?.phone || 'No phone',
                                license: d.licenseNumber
                            }))
                        });
                    }
                } catch (error) {
                    console.error('Error searching drivers:', error);
                }
            }

            // Search vehicles (if user has access)
            if (user?.role !== 'DRIVER') {
                try {
                    const vehicleResponse = await apiFetch(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/vehicles?search=${encodeURIComponent(searchTerm)}&pageSize=3`
                    );
                    const vehicleData = await vehicleResponse.json();
                    if (vehicleData && vehicleData.length > 0) {
                        results.push({
                            type: 'vehicles',
                            label: 'Vehicles',
                            icon: <FaTruck className="w-4 h-4" />,
                            items: vehicleData.map(v => ({
                                id: v.id,
                                title: v.number,
                                subtitle: v.model,
                                capacity: v.capacity
                            }))
                        });
                    }
                } catch (error) {
                    console.error('Error searching vehicles:', error);
                }
            }

            // Search employees (if user has access)
            if (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') {
                try {
                    const employeeResponse = await apiFetch(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/employees?search=${encodeURIComponent(searchTerm)}&pageSize=3`
                    );
                    const employeeData = await employeeResponse.json();
                    if (employeeData && employeeData.length > 0) {
                        results.push({
                            type: 'employees',
                            label: 'Employees',
                            icon: <FaBuilding className="w-4 h-4" />,
                            items: employeeData.map(e => ({
                                id: e.id,
                                title: e.name,
                                subtitle: e.department,
                                position: e.position
                            }))
                        });
                    }
                } catch (error) {
                    console.error('Error searching employees:', error);
                }
            }

            // Search expenses (if user has access)
            if (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') {
                try {
                    const expenseResponse = await apiFetch(
                        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/expenses?search=${encodeURIComponent(searchTerm)}&pageSize=3`
                    );
                    const expenseData = await expenseResponse.json();
                    if (expenseData && expenseData.length > 0) {
                        results.push({
                            type: 'expenses',
                            label: 'Expenses',
                            icon: <FaMoneyBillWave className="w-4 h-4" />,
                            items: expenseData.map(e => ({
                                id: e.id,
                                title: e.description,
                                subtitle: e.category,
                                amount: e.amount,
                                status: e.status
                            }))
                        });
                    }
                } catch (error) {
                    console.error('Error searching expenses:', error);
                }
            }

            setSearchResults(results);
        } catch (error) {
            console.error('Error in global search:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        
        if (value.trim()) {
            handleGlobalSearch(value);
        } else {
            setSearchResults([]);
            setShowResults(false);
        }
    };

    // Handle result click
    const handleResultClick = (type, item) => {
        setShowResults(false);
        setSearch("");
        
        switch (type) {
            case 'shipments':
                navigate(`/shipments/${item.id}`);
                break;
            case 'drivers':
                navigate(`/drivers/${item.id}`);
                break;
            case 'vehicles':
                navigate(`/vehicles/${item.id}`);
                break;
            case 'employees':
                navigate(`/employees/${item.id}`);
                break;
            case 'expenses':
                navigate(`/expenses/${item.id}`);
                break;
            default:
                break;
        }
    };

    // Handle view all results
    const handleViewAll = (type) => {
        setShowResults(false);
        setSearch("");
        
        switch (type) {
            case 'shipments':
                navigate(`/shipments?search=${encodeURIComponent(search)}`);
                break;
            case 'drivers':
                navigate(`/drivers?search=${encodeURIComponent(search)}`);
                break;
            case 'vehicles':
                navigate(`/vehicles?search=${encodeURIComponent(search)}`);
                break;
            case 'employees':
                navigate(`/employees?search=${encodeURIComponent(search)}`);
                break;
            case 'expenses':
                navigate(`/expenses?search=${encodeURIComponent(search)}`);
                break;
            default:
                break;
        }
    };

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target) &&
                resultsRef.current && !resultsRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center gap-x-4">
            <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                onClick={onSidebarToggle}
            >
                <span className="sr-only">Open sidebar</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            
            {/* Global Search Bar */}
            <div className="flex-1 relative" ref={searchRef}>
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && searchResults.length > 0) {
                                handleViewAll(searchResults[0].type);
                            }
                        }}
                        placeholder="Search shipments, drivers, vehicles, employees, expenses..."
                        className="w-full max-w-md px-4 py-2 rounded-full border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700 text-sm shadow-sm transition"
                    />
                </div>

                {/* Search Results Dropdown */}
                {showResults && (
                    <div 
                        ref={resultsRef}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
                    >
                        {searchResults.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                {isSearching ? 'Searching...' : 'No results found'}
                            </div>
                        ) : (
                            <div className="py-2">
                                {searchResults.map((category, index) => (
                                    <div key={index} className="mb-4">
                                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                                {category.icon}
                                                {category.label}
                                            </div>
                                            <button
                                                onClick={() => handleViewAll(category.type)}
                                                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                                            >
                                                View all
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            {category.items.map((item, itemIndex) => (
                                                <button
                                                    key={itemIndex}
                                                    onClick={() => handleResultClick(category.type, item)}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">
                                                                {item.title}
                                                            </div>
                                                            <div className="text-sm text-gray-500 truncate">
                                                                {item.subtitle}
                                                            </div>
                                                        </div>
                                                        {item.amount && (
                                                            <div className="text-sm font-medium text-green-600">
                                                                ₹{item.amount}
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-x-2">
                {/* Modern avatar */}
                <div className="relative">
                    <span className="inline-block w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow">
                        {user?.name ? user.name[0].toUpperCase() : "U"}
                    </span>
                </div>
                
                {/* Profile button */}
                <button
                    onClick={handleProfile}
                    className="ml-2 p-2 rounded-full hover:bg-gray-100 text-gray-600 transition flex items-center justify-center"
                    title="Profile"
                    aria-label="Profile"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </button>
                
                {/* Settings button */}
                <button
                    onClick={handleAccountSettings}
                    className="ml-2 p-2 rounded-full hover:bg-gray-100 text-gray-600 transition flex items-center justify-center"
                    title="Settings"
                    aria-label="Settings"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                
                {/* Logout button */}
                <button
                    onClick={handleLogout}
                    className="ml-2 p-2 rounded-full hover:bg-red-50 text-red-500 transition flex items-center justify-center"
                    title="Logout"
                    aria-label="Logout"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                    </svg>
                </button>
            </div>
        </div>
    );
}