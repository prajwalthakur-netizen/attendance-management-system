import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSignupMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { ROLES } from '../utils/constants';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.EMPLOYEE,
  });
  const [error, setError] = useState('');
  const [signup, { isLoading }] = useSignupMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await signup(formData).unwrap();
      dispatch(setCredentials({ user: res.user, token: res.token }));
      navigate(`/${res.user.role}`);
    } catch (err) {
      setError(err?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Signup</h2>

        {error && <p className="error-text">{error}</p>}

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password (min 6 characters)"
          value={formData.password}
          onChange={handleChange}
          minLength={6}
          required
        />

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value={ROLES.EMPLOYEE}>Employee</option>
          <option value={ROLES.MANAGER}>Manager</option>
          <option value={ROLES.ADMIN}>Admin</option>
        </select>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing up...' : 'Signup'}
        </button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;