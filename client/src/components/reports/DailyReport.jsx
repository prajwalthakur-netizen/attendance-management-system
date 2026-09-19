import { useState } from 'react';
import { useGetDailyReportQuery } from '../../features/reports/reportApi';

const DailyReport = () => {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const { data, isLoading } = useGetDailyReportQuery({ date });

  return (
    <div>
      <h3>Daily Attendance Report</h3>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Selfie</th>
              <th>Location</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Validation</th>
            </tr>
          </thead>
          <tbody>
            {data?.report?.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.punchInTime ? new Date(r.punchInTime).toLocaleTimeString() : '—'}</td>
                <td>{r.punchOutTime ? new Date(r.punchOutTime).toLocaleTimeString() : '—'}</td>
                <td>
                  {r.punchInSelfie && (
                    <img src={r.punchInSelfie} alt="selfie" className="selfie-thumb" />
                  )}
                </td>
                <td>
                  {r.location ? `${r.location.latitude.toFixed(3)}, ${r.location.longitude.toFixed(3)}` : '—'}
                </td>
                <td>{r.totalWorkingHours}</td>
                <td>{r.status}</td>
                <td>{r.validationStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DailyReport;