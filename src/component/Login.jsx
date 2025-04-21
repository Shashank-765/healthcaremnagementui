import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateLogin } from '../services/authValidation';
import './Login.css';
import doctorImage from '../image/registernow.png';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Login attempt with:', formData);
    
    // Validate credentials
    const validationResult = validateLogin(
      formData.email,
      formData.password,
      formData.userType
    );

    console.log('Validation result:', validationResult);

    if (!validationResult.isValid) {
      setError(validationResult.message);
      return;
    }

    // Set user role in localStorage
    localStorage.setItem('userRole', formData.userType);

    // If validation successful, navigate to appropriate dashboard
    if (validationResult.userType === 'doctor') {
      navigate('/doctor-dashboard');
    } else {
      navigate('/patient-dashboard');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    console.log('Forgot password clicked');
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
              <button 
                onClick={handleForgotPassword}
                className="forgot-password-btn"
                type="button"
              >
                Forgot Password?
              </button>
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