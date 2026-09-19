import { useSelector } from 'react-redux';
import PunchInOut from './PunchInOut';
import OvertimeRequest from '../../components/attendance/OvertimeRequest';
import AttendanceHistory from '../../components/attendance/AttendanceHistory';

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <div className="dashboard-header">
        <h2>Employee Dashboard</h2>
      </div>

      <p className="welcome-text">Welcome, {user?.name}</p>

      <section>
        <PunchInOut />
      </section>

      <section>
        <OvertimeRequest />
      </section>

      <section>
        <AttendanceHistory />
      </section>
    </div>
  );
};

export default EmployeeDashboard;