import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute - Wraps routes that require authentication
 * Redirects to /login if user is not authenticated
 */
export default function AdminProtectedRoute({ children }: ProtectedRouteProps) {
    const { token, user } = useAuthStore();

    if(!token || !user){
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
