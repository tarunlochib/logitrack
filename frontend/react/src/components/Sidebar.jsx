import { Link, useNavigate, useLocation } from "react-router-dom";
import ModernButton from "./ModernButton";

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const navLinks = [
        { to: "/dashboard", label: "Dashboard", roles: ["SUPERADMIN", "ADMIN", "DISPATCHER", "DRIVER"] },
        { to: "/shipments", label: "Shipments", roles: ["SUPERADMIN", "ADMIN", "DISPATCHER", "DRIVER"] },
        { to: "/vehicles", label: "Vehicles", roles: ["SUPERADMIN", "ADMIN"] },
        { to: "/drivers", label: "Drivers", roles: ["SUPERADMIN", "ADMIN"] },
        { to: "/analytics", label: "Analytics", roles: ["SUPERADMIN", "ADMIN", "DISPATCHER"] },
    ];

    return (
        <div className="fixed md:static top-0 left-0 z-40 h-full w-64 bg-gray-900/90 text-white border-r border-gray-800 shadow-2xl rounded-r-2xl p-5 flex flex-col justify-between transition-transform duration-300 backdrop-blur-md">
            <div>
                <h2 className="text-2xl font-bold mb-8 text-white">LogiTrack</h2>
                <nav className="flex flex-col space-y-2">
                    {navLinks.filter(link => link.roles.includes(role)).map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`px-3 py-2 rounded-lg font-medium transition-colors duration-150 ${location.pathname.startsWith(link.to) ? "bg-cyan-500 text-white shadow" : "text-white/80 hover:bg-cyan-700 hover:text-white"}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="flex flex-col space-y-3 mt-8">
                {role === 'SUPERADMIN' && (
                    <ModernButton
                        variant="primary"
                        size="md"
                        className="w-full justify-center bg-cyan-600 hover:bg-cyan-700 text-white border-none"
                        onClick={() => {
                            navigate('/add-user');
                        }}
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                        Add User
                    </ModernButton>
                )}
            </div>
        </div>
    );
}