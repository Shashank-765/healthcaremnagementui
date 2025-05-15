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
    userType: 'patient'
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const endpoint = formData.userType === 'doctor' ? '/doctor/doctorlogin' : '/patient/patientlogin';
      
      const loginData = {
        email: formData.email.trim(),
        password: formData.password.trim()
      };
      
      const response = await axios.post(`${API_URL}${endpoint}`, loginData);

      if (response.data.statusCode === 200 && response.data.data) {
        // Store complete user data
        const userData = {
          email: response.data.data.email,
          token: response.data.data.token,
          role: formData.userType,
          id: response.data.data._id,
          fullName: response.data.data.fullName || response.data.data.name
        };

        // Clear any existing data first
        localStorage.removeItem('userData');
        
        // Store in localStorage
        localStorage.setItem('userData', JSON.stringify(userData));

        // Navigate based on role
        if (formData.userType === 'doctor') {
          navigate('/doctor/doctor-dashboard');
        } else {
          navigate('/patient/patient-dashboard');
        }

        // Clear form data
        setFormData({
          email: '',
          password: '',
          rememberMe: false,
          userType: 'patient'
        });

      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      // Handle specific error cases
      if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message === 'Network Error') {
        setError('Network error. Please check your connection.');
      } else {
        setError('Login failed. Please try again.');
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