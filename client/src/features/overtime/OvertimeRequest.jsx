import { useState } from 'react';
import { useRequestOvertimeMutation, useGetMyOvertimeQuery } from '../../features/overtime/overtimeApi';

const OvertimeRequest = () => {
  const [formData, setFormData] = useState({ date: '', requestedHours: '', reason: '' });
  const [message, setMessage] = useState('');

  const [requestOvertime, { isLoading }] = useRequestOvertimeMutation();
  const { data, refetch } = useGetMyOvertimeQuery({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await requestOvertime({
        ...formData,
        requestedHours: Number(formData.requestedHours),
      }).unwrap();
      setMessage('Overtime request submitted!');
      setFormData({ date: '', requestedHours: '', reason: '' });
      refetch();
    } catch (err) {
      setMessage(err?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="overtime-section">
      <h3>Request Overtime</h3>

      {message && <p className="info-text">{message}</p>}

      <form onSubmit={handleSubmit} className="overtime-form">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          required
        />
        <input
          type="number"
          name="requestedHours"
          placeholder="Hours"
          min="0.5"
          step="0.5"
          value={formData.requestedHours}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="reason"
          placeholder="Reason"
          value={formData.reason}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      <h4>My Overtime Requests</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Hours</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Review Remarks</th>
          </tr>
        </thead>
        <tbody>
          {data?.records?.map((r) => (
            <tr key={r._id}>
              <td>{r.date}</td>
              <td>{r.requestedHours}</td>
              <td>{r.reason}</td>
              <td>{r.status}</td>
              <td>{r.reviewRemarks || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OvertimeRequest;