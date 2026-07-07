import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap any page with this to require login first.
// Usage: <ProtectedRoute><Dashboard /></ProtectedRoute>
export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
