import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../api";

export default function ProtectedRoute({ children, requiredRole, allowedRoles }) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const role = user?.role;

    // Check if user is authenticated
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // Support allowedRoles (array) or requiredRole (string)
    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        return <Navigate to="/dashboard" replace />;
    }
    
    if (requiredRole && (!role || role !== requiredRole)) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return children;
}