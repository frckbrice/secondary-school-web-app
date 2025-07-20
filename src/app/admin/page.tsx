import ProtectedRoute from '../../lib/protected-route';
import AdminDashboard from '../../components/pages/admin';

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
