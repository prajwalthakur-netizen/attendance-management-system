import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../../utils/socket';
import DailyReport from '../../components/reports/DailyReport';
import Loader from '../../components/common/Loader';
import {
  useGetTeamAttendanceQuery,
  useValidateAttendanceMutation,
} from '../../features/attendance/attendanceApi';
import {
  useGetPendingOvertimeQuery,
  useReviewOvertimeMutation,
} from '../../features/overtime/overtimeApi';

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [remarksMap, setRemarksMap] = useState({});

  const {
    data: attendanceData,
    isLoading: loadingAttendance,
    refetch: refetchAttendance,
  } = useGetTeamAttendanceQuery({
    page,
    limit: 10,
  });
  const {
    data: overtimeData,
    isLoading: loadingOvertime,
    refetch: refetchOvertime,
  } = useGetPendingOvertimeQuery({});

  const [validateAttendance] = useValidateAttendanceMutation();
  const [reviewOvertime] = useReviewOvertimeMutation();

  useEffect(() => {
    const handleUpdate = () => {
      refetchAttendance();
      refetchOvertime();
    };

    socket.on('attendance-updated', handleUpdate);
    socket.on('overtime-updated', handleUpdate);

    return () => {
      socket.off('attendance-updated', handleUpdate);
      socket.off('overtime-updated', handleUpdate);
    };
  }, []);

  const handleValidate = async (id, status) => {
    try {
      await validateAttendance({ id, status, remarks: remarksMap[id] || '' }).unwrap();
    } catch (err) {
      alert(err?.data?.message || 'Validation failed');
    }
  };

  const handleOvertimeReview = async (id, status) => {
    try {
      await reviewOvertime({ id, status }).unwrap();
    } catch (err) {
      alert(err?.data?.message || 'Review failed');
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <h2>Manager Dashboard</h2>
      </div>

      <p className="welcome-text">Welcome, {user?.name}</p>

      <section>
        <h3>Team Attendance</h3>
        {loadingAttendance ? (
          <Loader />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Punch In</th>
                <th>Punch Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Selfie (In)</th>
                <th>Validation</th>
                <th>Remarks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData?.records?.map((record) => (
                <tr key={record._id}>
                  <td>{record.employee?.name}</td>
                  <td>{record.date}</td>
                  <td>{record.punchIn?.time ? new Date(record.punchIn.time).toLocaleTimeString() : '—'}</td>
                  <td>{record.punchOut?.time ? new Date(record.punchOut.time).toLocaleTimeString() : '—'}</td>
                  <td>{record.totalWorkingHours}</td>
                  <td>{record.status}</td>
                  <td>
                    {record.punchIn?.selfieUrl && (
                      <img src={record.punchIn.selfieUrl} alt="selfie" className="selfie-thumb" />
                    )}
                  </td>
                  <td>{record.validation?.status}</td>
                  <td>
                    <input
                      type="text"
                      placeholder="Remarks"
                      value={remarksMap[record._id] || ''}
                      onChange={(e) =>
                        setRemarksMap({ ...remarksMap, [record._id]: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    {record.validation?.status === 'Pending' ? (
                      <>
                        <button onClick={() => handleValidate(record._id, 'Valid')}>Valid</button>
                        <button onClick={() => handleValidate(record._id, 'Invalid')}>Invalid</button>
                      </>
                    ) : (
                      <span className={record.validation?.status === 'Valid' ? 'status-valid' : 'status-invalid'}>
                        {record.validation?.status}
                      </span>
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
            disabled={attendanceData && page * 10 >= attendanceData.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </section>

      <section>
        <h3>Pending Overtime Requests</h3>
        {loadingOvertime ? (
          <Loader />
        ) : overtimeData?.records?.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Requested Hours</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {overtimeData?.records?.map((req) => (
                <tr key={req._id}>
                  <td>{req.employee?.name}</td>
                  <td>{req.date}</td>
                  <td>{req.requestedHours}</td>
                  <td>{req.reason}</td>
                  <td>
                    <button onClick={() => handleOvertimeReview(req._id, 'Approved')}>Approve</button>
                    <button onClick={() => handleOvertimeReview(req._id, 'Rejected')}>Reject</button>
                  </td>
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

export default ManagerDashboard;