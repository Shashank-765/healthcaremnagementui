import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/adminStyle.css';
import doctorImage from '../image/registernow.png';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle login authentication
    console.log('Login attempted:', formData);
    // Navigate to admin dashboard after successful login
    navigate('/admin/admin-dashboard');
  };

  return (
    <div className="login-container-admin">
      <div className="login-left">
        <h2>Login To Your Account!</h2>
        <div className="role-selector">
          <input type="text" value="Admin" readOnly />
        </div>
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
          <button type="submit" className="login-button">Login</button>
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
