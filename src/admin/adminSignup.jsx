import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/adminStyle.css';
import doctorImage from '../image/register5.png'; // Use your patient registration image

const AdminSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    totalHospital: '',
    totalBeds: '',
    hospitalName: '',
    doctorsCount: '',
    nursesCount: '',
    receptionistsCount: '',
    otherStaffCount: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    phone: ''
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone) {
      return 'Phone number is required';
    }
    if (!phoneRegex.test(phone)) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    if (name === 'email') {
      setErrors(prev => ({
        ...prev,
        email: validateEmail(value)
      }));
    }
    
    if (name === 'phone') {
      setErrors(prev => ({
        ...prev,
        phone: validatePhone(value)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);

    setErrors({
      email: emailError,
      phone: phoneError
    });

    // If there are any errors, don't submit
    if (emailError || phoneError) {
      return;
    }

    console.log('Form submitted:', formData);
    navigate('/admin/login');
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <h2>Admin Registration</h2>
        <div className="role-selector">
          <input type="text" value="Admin" readOnly />
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            <div className="section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Full Name"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Contact Number (10 digits)"
                  className={`signup-input ${errors.phone ? 'error-input' : ''}`}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Email Address"
                  className={`signup-input ${errors.email ? 'error-input' : ''}`}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Password"
                  className="signup-input"
                />
              </div>
            </div>

            <div className="section">
              <h3>Hospital Information</h3>
              <div className="form-group">
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleInputChange}
                  placeholder="Hospital Name"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="totalHospital"
                  value={formData.totalHospital}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="Total Hospitals"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="totalBeds"
                  value={formData.totalBeds}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="Total Beds"
                  className="signup-input"
                />
              </div>
            </div>

            <div className="section">
              <h3>Staff Information</h3>
              <div className="form-group">
                <input
                  type="number"
                  name="doctorsCount"
                  value={formData.doctorsCount}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Number of Doctors"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="nursesCount"
                  value={formData.nursesCount}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Number of Nurses"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="receptionistsCount"
                  value={formData.receptionistsCount}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Number of Receptionists"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="otherStaffCount"
                  value={formData.otherStaffCount}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Number of Other Staff"
                  className="signup-input"
                />
              </div>
            </div>
          </div>

          <div className="button-group">
            <button 
              type="submit" 
              className="register-button"
              disabled={errors.email || errors.phone}
            >
              Register as Admin
            </button>
            <div className="login-prompt">
              Back to <span onClick={() => navigate('/admin/login')} className="login-link">Login</span>
            </div>
          </div>
        </form>
      </div>
      <div className="signup-right">
        <img src={doctorImage} alt="Hospital illustration" />
      </div>
    </div>
  );
};

export default AdminSignup;
