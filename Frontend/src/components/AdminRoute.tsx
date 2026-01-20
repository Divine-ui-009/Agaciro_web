import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react/jsx-dev-runtime";

function AdminRoute({ children }: { children: JSX.Element }) {
    const { user } = useAuth();

    console.log('AdminRoute - user:', user); // Debug log
    console.log('AdminRoute - user role:', user?.role); // Debug log

    if (!user) {
        console.log('AdminRoute - no user, redirecting to login'); // Debug log
        return <Navigate to="/login" />;
    }
    if (user.role !== 'admin') {
        console.log('AdminRoute - user is not admin, redirecting to home'); // Debug log
        return <Navigate to="/" />;
    }
    
    console.log('AdminRoute - allowing access to admin page'); // Debug log
    return children;
}

export default AdminRoute;