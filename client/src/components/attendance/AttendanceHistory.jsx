import { useState, useEffect } from 'react';
import { socket } from '../../utils/socket';
import { useGetMyAttendanceQuery } from '../../features/attendance/attendanceApi';

const AttendanceHistory = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetMyAttendanceQuery({
    from: dateFrom || undefined,
    to: dateTo || undefined,
    page,
    limit: 10,
  });

  useEffect(() => {
    const handleUpdate = () => refetch();

    socket.on('attendance-updated', handleUpdate);

    return () => {
      socket.off('attendance-updated', handleUpdate);
    };
  }, []);

  return (
    <>
      <h3>My Attendance History</h3>

      <div className="overtime-form">
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Validation</th>
            </tr>
          </thead>
          <tbody>
            {data?.records?.map((r) => (
              <tr key={r._id}>
                <td>{r.date}</td>
                <td>{r.punchIn?.time ? new Date(r.punchIn.time).toLocaleTimeString() : '—'}</td>
                <td>{r.punchOut?.time ? new Date(r.punchOut.time).toLocaleTimeString() : '—'}</td>
                <td>{r.totalWorkingHours}</td>
                <td>{r.status}</td>
                <td>{r.validation?.status}</td>
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
          disabled={data && page * 10 >= data.total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default AttendanceHistory;