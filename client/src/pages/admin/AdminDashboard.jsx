import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../../utils/socket';
import {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useAssignManagerMutation,
} from '../../features/users/userApi';
import { useGetTeamAttendanceQuery } from '../../features/attendance/attendanceApi';
import DailyReport from '../../components/reports/DailyReport';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading: loadingUsers, refetch: refetchUsers } = useGetAllUsersQuery({
    role: roleFilter || undefined,
    page,
    limit: 10,
  });
  const {
    data: attendanceData,
    isLoading: loadingAttendance,
    refetch: refetchAttendance,
  } = useGetTeamAttendanceQuery({
    page: 1,
    limit: 10,
  });

  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [assignManager] = useAssignManagerMutation();

  const managers = usersData?.users?.filter((u) => u.role === 'manager') || [];

  useEffect(() => {
    const handleAttendanceUpdate = () => {
      refetchAttendance();
    };
    const handleUserUpdate = () => {
      refetchUsers();
    };

    socket.on('attendance-updated', handleAttendanceUpdate);
    socket.on('overtime-updated', handleAttendanceUpdate);
    socket.on('user-updated', handleUserUpdate);

    return () => {
      socket.off('attendance-updated', handleAttendanceUpdate);
      socket.off('overtime-updated', handleAttendanceUpdate);
      socket.off('user-updated', handleUserUpdate);
    };
  }, []);

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