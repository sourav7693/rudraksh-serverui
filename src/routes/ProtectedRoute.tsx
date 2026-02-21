import { Navigate } from "react-router-dom";
import type { JSX } from "react";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  permission?: string;
}

const ProtectedRoute = ({ children, permission }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (user.role !== "admin") {
    if (
      permission &&
      (!Array.isArray(user.permissions) ||
        !user.permissions.includes(permission))
    ) {
      return <Navigate to="/admin-login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
