import { useState, useEffect } from 'react';
import { socket } from '../../utils/socket';
import CameraCapture from '../../components/attendance/CameraCapture';
import LocationCapture from '../../components/attendance/LocationCapture';
import {
  usePunchInMutation,
  usePunchOutMutation,
  useGetMyAttendanceQuery,
} from '../../features/attendance/attendanceApi';

const PunchInOut = () => {
  const [mode, setMode] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');

  const [punchIn, { isLoading: isPunchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: isPunchingOut }] = usePunchOutMutation();

  const today = new Date().toISOString().split('T')[0];
  const { data, refetch } = useGetMyAttendanceQuery({ from: today, to: today });
  const todayRecord = data?.records?.[0];

  useEffect(() => {
    const handleUpdate = () => refetch();

    socket.on('attendance-updated', handleUpdate);

    return () => {
      socket.off('attendance-updated', handleUpdate);
    };
  }, []);

  const resetCapture = () => {
    setMode(null);
    setSelfie(null);
    setLocation(null);
  };

  const handleSubmit = async () => {
    if (!selfie || !location) {
      setMessage('Please capture both selfie and location first');
      return;
    }

    const payload = { selfie, latitude: location.latitude, longitude: location.longitude };

    try {
      if (mode === 'in') {
        await punchIn(payload).unwrap();
        setMessage('Punched in successfully!');
      } else {
        await punchOut(payload).unwrap();
        setMessage('Punched out successfully!');
      }
      resetCapture();
      refetch();
    } catch (err) {
      setMessage(err?.data?.message || 'Something went wrong');
    }
  };

  const alreadyPunchedIn = !!todayRecord?.punchIn?.time;
  const alreadyPunchedOut = !!todayRecord?.punchOut?.time;

  return (
    <>
      <h3>Today's Attendance</h3>

      {message && <p className="info-text">{message}</p>}

      {todayRecord && (
        <div className="today-summary">
          <p>Punch In: {todayRecord.punchIn?.time ? new Date(todayRecord.punchIn.time).toLocaleTimeString() : '—'}</p>
          <p>Punch Out: {todayRecord.punchOut?.time ? new Date(todayRecord.punchOut.time).toLocaleTimeString() : '—'}</p>
          <p>Total Hours: {todayRecord.totalWorkingHours || 0}</p>
          <p>Status: {todayRecord.status}</p>
        </div>
      )}

      {!mode && (
        <div className="punch-actions">
          <button disabled={alreadyPunchedIn} onClick={() => setMode('in')}>
            Punch In
          </button>
          <button disabled={!alreadyPunchedIn || alreadyPunchedOut} onClick={() => setMode('out')}>
            Punch Out
          </button>
        </div>
      )}

      {mode && (
        <div className="capture-flow">
          <h4>{mode === 'in' ? 'Punch In' : 'Punch Out'}</h4>

          <CameraCapture onCapture={setSelfie} />
          <LocationCapture onCapture={setLocation} />

          <div className="capture-buttons">
            <button
              onClick={handleSubmit}
              disabled={!selfie || !location || isPunchingIn || isPunchingOut}
            >
              {isPunchingIn || isPunchingOut ? 'Submitting...' : 'Submit'}
            </button>
            <button onClick={resetCapture}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default PunchInOut;