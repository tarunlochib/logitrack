import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole, allowedRoles }) {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;

    if (!token) {
        return <Navigate to="/" />;
    }
    // Support allowedRoles (array) or requiredRole (string)
    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        return <Navigate to="/dashboard" />;
    }
    if (requiredRole && (!role || role !== requiredRole)) {
        return <Navigate to="/dashboard" />;
    }
    return children;
}