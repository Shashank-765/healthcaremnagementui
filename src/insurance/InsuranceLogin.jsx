import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/adminStyle.css';
import doctorImage from '../image/registernow.png';
import Cookies from 'js-cookie';

// Update API URL to match your backend structure
const API_URL = 'http://localhost:5000/api/v1';

const InsuranceLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }

      // Make login request
      const response = await fetch(`${API_URL}/insurance/insurance-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include',
        mode: 'cors'
      });

      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Login response:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Check for token
      const token = data.token;
      if (!token) {
        console.error('No token found in response:', data);
        throw new Error('No token received from server');
      }

      // Store the token and user data in cookies
      Cookies.set('token', token, { 
        expires: 30,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      Cookies.set('userRole', 'insurance', {
        expires: 30,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      const userId = data.user?._id;
      if (userId) {
        Cookies.set('userId', userId, {
          expires: 30,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        });
      }

      // Verify cookies were set
      const storedToken = Cookies.get('token');
      console.log('Stored token:', storedToken);

      if (!storedToken) {
        throw new Error('Failed to store token');
      }

      console.log('Login successful, redirecting to dashboard');
      navigate('/insurance/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Failed to fetch') {
        setError('Unable to connect to server. Please make sure the server is running at http://localhost:5000');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container-admin">
      <div className="login-left">
        <h2>Login To Your Account!</h2>
        <div className="role-selector">
          <input type="text" value="Insurance" readOnly />
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email"
              className="login-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter your password"
              className="login-input"
            />
          </div>
          <div className="remember-forgot">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember Me</span>
            </label>
            <a href="#" className="forgot-password">Forgot Password?</a>
          </div>
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          <div className="signup-prompt">
            Not Registered Yet? <span onClick={() => navigate('/insurance/signup')} className="signup-link">Sign-Up</span>
          </div>
        </form>
      </div>
      <div className="login-right">
        <img src={doctorImage} alt="Doctor illustration" />
      </div>
    </div>
  );
};

export default InsuranceLogin;