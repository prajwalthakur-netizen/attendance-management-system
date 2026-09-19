import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dashboardPath = user?.role ? `/${user.role}` : '/login';

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? dashboardPath : '/login'} replace />}
      />

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={dashboardPath} replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to={dashboardPath} replace /> : <Signup />}
      />

      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/unauthorized" element={<h2>403 - Not Authorized</h2>} />
      <Route path="*" element={<h2>404 - Page Not Found</h2>} />
    </Routes>
  );
};

export default AppRoutes;