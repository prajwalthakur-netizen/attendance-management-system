import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/common/Navbar';
import { socket } from './utils/socket';
import { attendanceApi } from './features/attendance/attendanceApi';
import { overtimeApi } from './features/overtime/overtimeApi';
import { userApi } from './features/users/userApi';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleAttendanceUpdate = () => {
      dispatch(attendanceApi.util.invalidateTags(['Attendance']));
    };
    const handleOvertimeUpdate = () => {
      dispatch(overtimeApi.util.invalidateTags(['Overtime']));
    };
    const handleUserUpdate = () => {
      if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
        dispatch(userApi.util.invalidateTags(['User']));
      }
    };

    socket.on('attendance-updated', handleAttendanceUpdate);
    socket.on('overtime-updated', handleOvertimeUpdate);
    socket.on('user-updated', handleUserUpdate);

    return () => {
      socket.off('attendance-updated', handleAttendanceUpdate);
      socket.off('overtime-updated', handleOvertimeUpdate);
      socket.off('user-updated', handleUserUpdate);
    };
  }, [dispatch, currentUser]);

  return (
    <>
      <Navbar />
      <AppRoutes />
    </>
  );
}

export default App;