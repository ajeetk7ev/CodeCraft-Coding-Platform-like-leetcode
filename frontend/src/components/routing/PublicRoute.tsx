import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface PublicRouteProps {
    children: React.ReactNode;
}

/**
 * PublicRoute - Wraps routes that should only be accessible when NOT authenticated
 * Redirects to /problems if user is already logged in
 * Examples: /login, /signup
 */
export default function PublicRoute({ children }: PublicRouteProps) {
    const { token } = useAuthStore();

    if (token) {
        return <Navigate to="/problems" replace />;
    }

    return <>{children}</>;
}
