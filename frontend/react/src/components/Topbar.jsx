import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onSidebarToggle }) {
    const user = JSON.parse(localStorage.getItem("user"));
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }
        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownOpen]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    const handleProfile = () => {
        setDropdownOpen(false);
        navigate("/profile");
    };

    const handleAccountSettings = () => {
        setDropdownOpen(false);
        navigate("/account-settings");
    };

    return (
        <div className="w-full sticky top-0 z-30 bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 shadow-2xl flex justify-between items-center px-6 py-4">
            <div className="flex items-center space-x-3">
                {/* Hamburger menu for mobile */}
                <button
                    className="block lg:hidden mr-2 p-2 rounded-md text-gray-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    onClick={onSidebarToggle}
                    aria-label="Open sidebar"
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Admin Panel</h1>
            </div>
            
            <div className="relative" ref={dropdownRef}>
                <button
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-800/80 to-gray-700/80 hover:from-gray-700/90 hover:to-gray-600/90 border border-gray-600/50 shadow-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-200 transform hover:scale-105"
                    onClick={() => setDropdownOpen((open) => !open)}
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                >
                    <div className="relative">
                        <span className="inline-block w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                            {user?.name ? user.name[0].toUpperCase() : "U"}
                        </span>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-gray-800 rounded-full"></div>
                    </div>
                    <div className="hidden sm:block text-left">
                        <div className="text-white font-semibold">{user?.name || "User"}</div>
                        <div className="text-xs text-gray-400 capitalize">{user?.role?.toLowerCase() || "User"}</div>
                    </div>
                    <svg className={`w-4 h-4 ml-1 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                
                {dropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 py-2 z-50 animate-fade-in overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-700/50">
                            <div className="text-white font-semibold">{user?.name || "User"}</div>
                            <div className="text-sm text-gray-400 capitalize">{user?.role?.toLowerCase() || "User"}</div>
                        </div>
                        
                        <div className="py-2">
                            <button 
                                onClick={handleProfile}
                                className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-gray-700/80 hover:to-gray-600/80 text-white/90 transition-all duration-150 flex items-center space-x-3 group"
                            >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Profile</span>
                            </button>
                            
                            <button 
                                onClick={handleAccountSettings}
                                className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-gray-700/80 hover:to-gray-600/80 text-white/90 transition-all duration-150 flex items-center space-x-3 group"
                            >
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Account Settings</span>
                            </button>
                        </div>
                        
                        <div className="border-t border-gray-700/50 pt-2">
                            <button 
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-900/50 hover:to-red-800/50 text-red-400 font-medium transition-all duration-150 flex items-center space-x-3 group"
                            >
                                <svg className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}