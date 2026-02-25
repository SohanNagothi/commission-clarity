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

  // Case: Logged in but profile/role not loaded yet (should wait or repair)
  if (user && !role) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <h2 className="text-xl font-bold mb-2">Restoring your session...</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          If this takes too long, please try refreshing the page or checking your internet connection.
        </p>
      </div>
    );
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
