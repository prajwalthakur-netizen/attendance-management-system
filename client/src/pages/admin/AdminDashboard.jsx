import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useAssignManagerMutation,
  useDeleteUserMutation,
} from '../../features/users/userApi';
import { useGetTeamAttendanceQuery } from '../../features/attendance/attendanceApi';
import DailyReport from '../../components/reports/DailyReport';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading: loadingUsers } = useGetAllUsersQuery({
    role: roleFilter || undefined,
    page,
    limit: 10,
  });
  const { data: attendanceData, isLoading: loadingAttendance } = useGetTeamAttendanceQuery({
    page: 1,
    limit: 10,
  });

  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [assignManager] = useAssignManagerMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const managers = usersData?.users?.filter((u) => u.role === 'manager') || [];

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      await updateUserStatus({ id, isActive: !currentStatus }).unwrap();
    } catch (err) {
      alert(err?.data?.message || 'Update failed');
    }
  };

  const handleAssignManager = async (id, managerId) => {
    try {
      await assignManager({ id, managerId: managerId || null }).unwrap();
    } catch (err) {
      alert(err?.data?.message || 'Assign failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name}? This will deactivate their account and remove them from all lists.`)) {
      return;
    }
    try {
      await deleteUser(id).unwrap();
    } catch (err) {
      alert(err?.data?.message || 'Remove failed');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h2>Admin Dashboard</h2>
      </div>

      <p className="welcome-text">Welcome, {user?.name}</p>

      <section>
        <h3>All Users</h3>

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>

        {loadingUsers ? (
          <Loader />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Manager</th>
                <th>Active</th>
                <th>Assign Manager</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {usersData?.users?.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.manager?.name || '—'}</td>
                  <td>
                    <button onClick={() => handleStatusToggle(u._id, u.isActive)}>
                      {u.isActive ? 'Active (Deactivate)' : 'Inactive (Activate)'}
                    </button>
                  </td>
                  <td>
                    {u.role === 'employee' && (
                      <select
                        defaultValue={u.manager?._id || ''}
                        onChange={(e) => handleAssignManager(u._id, e.target.value)}
                      >
                        <option value="">No Manager</option>
                        {managers.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        className="danger-button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(u._id, u.name)}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <span>Page {page}</span>
          <button
            disabled={usersData && page * 10 >= usersData.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </section>

      <section>
        <h3>System-wide Attendance</h3>
        {loadingAttendance ? (
          <Loader />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Validation</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData?.records?.map((r) => (
                <tr key={r._id}>
                  <td>{r.employee?.name}</td>
                  <td>{r.date}</td>
                  <td>{r.totalWorkingHours}</td>
                  <td>{r.status}</td>
                  <td>{r.validation?.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <DailyReport />
      </section>
    </div>
  );
};

export default AdminDashboard;