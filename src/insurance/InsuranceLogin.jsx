import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/adminStyle.css';
import doctorImage from '../image/registernow.png';
import Cookies from 'js-cookie';

// Update API URL to match your backend structure
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

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

      console.log('Sending login request to:', `${API_URL}/insurance/insurance-login`);
      console.log('Request body:', { email: formData.email, password: formData.password });

      // Make login request
      const response = await fetch(`${API_URL}/insurance/insurance-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store the token and user data
      if (data.token) {
        Cookies.set('token', data.token, { expires: 1 }); // Token expires in 1 day
        Cookies.set('userRole', 'insurance', { expires: 1 });
        if (data.user) {
          Cookies.set('userData', JSON.stringify(data.user), { expires: 1 });
        }
        
        // Navigate to dashboard on success
        navigate('/insurance/dashboard');
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Failed to fetch') {
        setError('Unable to connect to server. Please check if the server is running.');
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