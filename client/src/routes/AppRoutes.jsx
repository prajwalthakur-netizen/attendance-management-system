import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

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