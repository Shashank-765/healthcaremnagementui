import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../insurance/InsuranceSignup.css';
import doctorImage from '../image/register5.png'; 
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const InsuranceSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    companyweburl: '',
    designation: '',
    registrationNumber: '',
    role: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    registrationNumber: ''
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

  const validateRegistrationNumber = (registrationNumber) => {
    if (!registrationNumber) {
      return 'Registration number is required';
    }
    if (registrationNumber.length < 5 || registrationNumber.length > 15) {
      return 'Registration number must be between 5 and 15 characters';
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
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profilePhoto: file });
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

    if (name === 'registrationNumber') {
      setErrors(prev => ({
        ...prev,
        registrationNumber: validateRegistrationNumber(value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const registrationNumberError = validateRegistrationNumber(formData.registrationNumber);

    setErrors({
      email: emailError,
      phone: phoneError,
      registrationNumber: registrationNumberError
    });

    // If there are any errors, don't submit
    if (emailError || phoneError || registrationNumberError) {
      return;
    }

    try {
      // Create FormData object to handle file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('companyName', formData.companyName);
      formDataToSend.append('companyweburl', formData.companyweburl);
      formDataToSend.append('registrationNumber', formData.registrationNumber);
      formDataToSend.append('designation', formData.designation);
      formDataToSend.append('role', formData.role);
      if (formData.profilePhoto) {
        formDataToSend.append('image', formData.profilePhoto);
      }

      const response = await fetch(`${API_URL}/insurance/insurance-signup`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success case
      alert('Registration successful! Please login to continue.');
      navigate('/insurance/login');
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-left">
        <h2>Insurance Registration Form</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-sections">
            <div className="section">
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
              <div className="form-group">
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="companyName"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input type="text"
                  name="companyweburl"
                  value={formData.companyweburl}
                  onChange={handleInputChange}
                  placeholder="companyweburl"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Registration Number (5-15 characters)"
                  className={`signup-input ${errors.registrationNumber ? 'error-input' : ''}`}
                />
                {errors.registrationNumber && <span className="error-message">{errors.registrationNumber}</span>}
              </div>
              <div className="form-group">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="role"
                  className="signup-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="designation"
                  className="signup-input"
                />
              </div>
            </div>
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="register-button"
              disabled={errors.email || errors.phone || errors.registrationNumber}
            >
              Register as Insurance
            </button>
            <div className="login-prompt">
              Back to <span onClick={() => navigate('/insurance/login')} className="login-link">Login</span>
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

export default InsuranceSignup;
