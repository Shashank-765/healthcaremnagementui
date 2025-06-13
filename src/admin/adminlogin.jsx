import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/adminStyle.css';
import doctorImage from '../image/registernow.png';
import Cookies from 'js-cookie';

// Update API URL to match your backend structure
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const AdminLogin = () => {
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
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }

      const response = await fetch(`${API_URL}/admin/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.data?.token) {
        throw new Error('No token received from server');
      }

      // Store token in cookies
      Cookies.set('adminToken', data.data.token, { expires: 7 }); // Token expires in 7 days

      // Store user data in localStorage
      const userData = {
        id: data.data._id,
        email: data.data.email,
        role: 'admin',
        token: data.data.token
      };
      localStorage.setItem('userData', JSON.stringify(userData));

      // Navigate to dashboard
      navigate('/admin/admin-dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container-admin">
      <div className="login-left">
        <h2>Login To Your Account!</h2>
        <div className="role-selector">
          <input type="text" value="Admin" readOnly />
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
            Not Registered Yet? <span onClick={() => navigate('/admin/signup')} className="signup-link">Sign-Up</span>
          </div>
        </form>
      </div>
      <div className="login-right">
        <img src={doctorImage} alt="Doctor illustration" />
      </div>
    </div>
  );
};

export default AdminLogin;
