import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in -> Login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but profile/role not loaded yet (should not happen with AuthProvider wait)
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // Check role permissions
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect unauthorized roles to their default dashboard
    const defaultPaths: Record<string, string> = {
      teacher: "/dashboard",
      owner: "/owner/dashboard",
      client: "/student/dashboard",
    };
    return <Navigate to={defaultPaths[role] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
