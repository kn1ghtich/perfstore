import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';

export default function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner size="lg" />;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
