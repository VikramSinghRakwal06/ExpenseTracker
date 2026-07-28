import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Renders children only for signed-in users; otherwise bounces to /login. */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Keeps signed-in users away from /login and /register. */
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}
