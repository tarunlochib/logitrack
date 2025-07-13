import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ onClose }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user"));

    // Role-based navigation links
    const getNavLinks = () => {
        if (!user) return [];

        switch (user.role) {
            case 'ADMIN':
                return [
                    { label: 'Dashboard', to: '/dashboard', icon: '🏠' },
                    { label: 'Shipments', to: '/shipments', icon: '📦' },
                    { label: 'Vehicles', to: '/vehicles', icon: '🚛' },
                    { label: 'Drivers', to: '/drivers', icon: '👨‍💼' },
                    { label: 'Employees', to: '/employees', icon: '👥' },
                    { label: 'Expenses', to: '/expenses', icon: '💰' },
                    { label: 'Analytics', to: '/analytics', icon: '📊' },
                    { label: 'P&L Statement', to: '/profit-loss', icon: '📈' },
                    { label: 'Add User', to: '/add-user', icon: '👤' },
                ];
            case 'DISPATCHER':
                return [
                    { label: 'Dashboard', to: '/dashboard', icon: '🏠' },
                    { label: 'Shipments', to: '/shipments', icon: '📦' },
                    { label: 'Vehicles', to: '/vehicles', icon: '🚛' },
                    { label: 'Drivers', to: '/drivers', icon: '👨‍💼' },
                ];
            case 'DRIVER':
                return [
                    { label: 'Dashboard', to: '/dashboard', icon: '🏠' },
                    { label: 'Shipments', to: '/shipments', icon: '📦' },
                ];
            default:
                return [];
        }
    };

    const navLinks = getNavLinks();

    const isActive = (href) => {
        return location.pathname === href;
    };

    return (
        <nav className="flex-1 space-y-2 px-4 py-6">
            {navLinks.map((item) => (
                <Link
                    key={item.label}
                    to={item.to}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        isActive(item.to)
                            ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                    }`}
                    onClick={onClose}
                >
                    <span className={`mr-3 text-lg ${isActive(item.to) ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`}>{item.icon}</span>
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}