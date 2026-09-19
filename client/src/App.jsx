import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/common/Navbar';
import { socket } from './utils/socket';
import { attendanceApi } from './features/attendance/attendanceApi';
import { overtimeApi } from './features/overtime/overtimeApi';
import './App.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAttendanceUpdate = () => {
      dispatch(attendanceApi.util.invalidateTags(['Attendance']));
    };
    const handleOvertimeUpdate = () => {
      dispatch(overtimeApi.util.invalidateTags(['Overtime']));
    };

    socket.on('attendance-updated', handleAttendanceUpdate);
    socket.on('overtime-updated', handleOvertimeUpdate);

    return () => {
      socket.off('attendance-updated', handleAttendanceUpdate);
      socket.off('overtime-updated', handleOvertimeUpdate);
    };
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <AppRoutes />
    </>
  );
}

export default App;