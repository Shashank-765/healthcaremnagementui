import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('patient'); // 'patient' or 'doctor'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginType === 'patient') {
        const response = await fetch(`${API_URL}/patient/patientlogin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
          // Store user data and token in localStorage
          localStorage.setItem('userData', JSON.stringify({
            _id: data.user._id,
            email: data.user.email,
            role: data.user.role,
            token: data.token
          }));
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', 'patient');
          navigate('/patient/patient-dashboard');
        } else {
          setError(data.message || 'Login failed');
        }
      } else {
        // Doctor login
        const response = await axios.post(`${API_URL}/doctor/doctorlogin`, {
          email,
          password
        });

        console.log('API Response:', response.data);

        if (response.data.statusCode === 200) {
          const { token } = response.data.data;
          
          // Decode token to get doctor ID
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          
          // Store doctor data and token
          localStorage.setItem('token', token);
          localStorage.setItem('userData', JSON.stringify({
            email: response.data.data.email,
            token: token,
            role: 'doctor'
          }));
          localStorage.setItem('userRole', 'doctor');
          
          // Clear any existing errors
          setError('');
          
          // Navigate to doctor dashboard
          console.log('Navigating to doctor dashboard...');
          navigate('/doctor/doctor-dashboard', { replace: true });
        } else {
          throw new Error(response.data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error.response?.data?.message || error.message);
      
      if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.message === 'Network Error') {
        setError('Unable to connect to server. Please check if the server is running.');
      } else {
        setError(error.response?.data?.message || error.message || 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <div className="login-type-selector">
        <button 
          type="button"
          className={loginType === 'patient' ? 'active' : ''} 
          onClick={() => setLoginType('patient')}
        >
          Patient Login
        </button>
        <button 
          type="button"
          className={loginType === 'doctor' ? 'active' : ''} 
          onClick={() => setLoginType('doctor')}
        >
          Doctor Login
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login; 