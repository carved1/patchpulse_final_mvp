import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ requiredRole, children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace state={{ denied: location.pathname }} />;
  }

  return children ?? <Outlet />;
}
