import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { validateLogin } from '../services/authValidation';
import './Login.css';
import doctorImage from '../image/registernow.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    userType: 'patient' // Default to patient
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate credentials
    const validationResult = validateLogin(
      formData.email,
      formData.password,
      formData.userType
    );

    if (!validationResult.isValid) {
      setError(validationResult.message);
      return;
    }

    try {
      const endpoint = formData.userType === 'doctor' ? '/doctor/doctorlogin' : '/patient/patientlogin';
      console.log('Making API call to:', `${API_URL}${endpoint}`);
      
      // Ensure password is sent as a string
      const loginData = {
        email: formData.email.trim(),
        password: formData.password.trim()
      };
      
      console.log('Sending login data:', loginData);
      
      const response = await axios.post(`${API_URL}${endpoint}`, loginData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response:', response.data);

      if (response.data.statusCode === 200) {
        const userData = response.data.data;
        localStorage.setItem('userData', JSON.stringify({
          _id: userData._id,
          email: userData.email,
          role: userData.role,
          token: userData.token
        }));
        
        // Navigate based on user type
        if (formData.userType === 'doctor') {
          console.log('Navigating to doctor dashboard');
          navigate('/doctor-dashboard', { replace: true });
        } else {
          console.log('Navigating to patient dashboard');
          navigate('/patient-dashboard', { replace: true });
        }
      } else {
        setError(response.data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message === 'Network Error') {
        setError('Unable to connect to server. Please check if the server is running.');
      } else {
        setError(error.response?.data?.message || 'An error occurred during login. Please try again.');
      }
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    navigate('/signup');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-form-section">
          <h1>Login To Your Account!</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="user-type-select"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className={error ? 'error-input' : ''}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className={error ? 'error-input' : ''}
              />
              {error && <div className="error-message">{error}</div>}
            </div>
            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>Remember Me</span>
              </label>
            </div>
            <button type="submit" className="login-button">Login</button>
            <div className="signup-prompt">
              Not Registered Yet? {' '}
              <button 
                onClick={handleSignUp}
                className="signup-link-btn"
                type="button"
              >
                Sign-Up
              </button>
            </div>
          </form>
        </div>
        <div className="login-image-section">
          <img src={doctorImage} alt="Doctor illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login; 