import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addUser } from "../services/authValidation";
import "./styles.css";
import easyCareLogo from '../image/registernow.png';
import logoImage2 from '../image/signupforpatientimage.jpg';
import register5 from '../image/register5.png';

const Signup = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("patient");
  const [formData, setFormData] = useState({
    // Common fields
    fullName: "",
    gender: "",
    dob: "",
    age: "",
    contactNumber: "",
    email: "",
    password: "",
    profilePhoto: null,

    // Patient specific fields
    bloodGroup: "",
    emergencyContact: "",
    allergies: "",
    medication: "",
    medicalHistory: "",

    // Doctor specific fields
    specialization: "",
    licenseNumber: "",
    experience: "",
    hospital: "",
    verified: false
  });

  const [errors, setErrors] = useState({
    contactNumber: "",
    emergencyContact: "",
    email: "",
    password: "",
    licenseNumber: "",
    experience: ""
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const specializations = [
    "Cardiology", "Neurology", "Pediatrics", "Orthopedics", 
    "Dermatology", "Ophthalmology", "ENT", "General Medicine"
  ];

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(number)) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const validateLicenseNumber = (number) => {
    const licenseRegex = /^\d{10}$/;
    if (!licenseRegex.test(number)) {
      return "Medical License Number must be exactly 10 digits";
    }
    return "";
  };

  const validateExperience = (years) => {
    if (!years) {
      return "Experience is required";
    }
    if (years < 1) {
      return "Experience must be at least 1 year";
    }
    if (years > 99) {
      return "Experience cannot exceed 99 years";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "contactNumber" || name === "emergencyContact") {
      // Only allow numbers and limit to 10 digits
      const numbersOnly = value.replace(/[^\d]/g, '').slice(0, 10);
      setFormData(prevState => ({
        ...prevState,
        [name]: numbersOnly
      }));
      
      // Validate and set error
      const error = validatePhoneNumber(numbersOnly);
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: error
      }));
    } else if (name === "email") {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
      const error = validateEmail(value);
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: error
      }));
    } else if (name === "password") {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
      const error = validatePassword(value);
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: error
      }));
    } else if (name === "licenseNumber") {
      // Only allow numbers and limit to 10 digits
      const numbersOnly = value.replace(/[^\d]/g, '').slice(0, 10);
      setFormData(prevState => ({
        ...prevState,
        [name]: numbersOnly
      }));
      
      // Validate and set error
      const error = validateLicenseNumber(numbersOnly);
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: error
      }));
    } else if (name === "experience") {
      // Only allow numbers and limit to 2 digits instead of 3
      const numbersOnly = value.replace(/[^\d]/g, '').slice(0, 2);
      setFormData(prevState => ({
        ...prevState,
        [name]: numbersOnly
      }));
      
      // Validate and set error
      const error = validateExperience(numbersOnly);
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: error
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleDOBChange = (e) => {
    const dob = e.target.value;
    const birthYear = new Date(dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    setFormData({ ...formData, dob, age: age.toString() });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, profilePhoto: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    const contactError = validatePhoneNumber(formData.contactNumber);
    const emergencyError = formData.emergencyContact ? validatePhoneNumber(formData.emergencyContact) : "";
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const licenseError = userType === "doctor" ? validateLicenseNumber(formData.licenseNumber) : "";
    const experienceError = userType === "doctor" ? validateExperience(formData.experience) : "";
    
    setErrors({
      contactNumber: contactError,
      emergencyContact: emergencyError,
      email: emailError,
      password: passwordError,
      licenseNumber: licenseError,
      experience: experienceError
    });

    if (contactError || emergencyError || emailError || passwordError || licenseError || experienceError) {
      return;
    }

    // Add user to mock database
    const result = addUser(formData.email, formData.password, userType);
    if (!result.success) {
      setErrors(prevErrors => ({
        ...prevErrors,
        email: result.message
      }));
      return;
    }
    
    console.log("Form Submitted", formData);
    
    // Show success message
    alert("Registration successful! Please login to continue.");
    
    // Navigate to home page with a slight delay to ensure the alert is shown
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 100);
  };

  const handleBackToLogin = (e) => {
    e.preventDefault();
    navigate('/', { replace: true });
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="signup-form-container">
          <h2>{userType === "patient" ? "Patient Registration" : "Doctor Registration"}</h2>
          <div className="toggle-buttons">
            <button 
              onClick={() => setUserType("patient")} 
              className={userType === "patient" ? "active" : ""}
            >
              Patient
            </button>
            <button 
              onClick={() => setUserType("doctor")} 
              className={userType === "doctor" ? "active" : ""}
            >
              Doctor
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Common Fields */}
            <div className="form-section">
              <h3>Basic Information</h3>
              <input 
                type="text" 
                name="fullName" 
                placeholder="Full Name *" 
                value={formData.fullName}
                onChange={handleChange} 
                required 
              />
              <select 
                name="gender" 
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input 
                type="date" 
                name="dob" 
                value={formData.dob}
                onChange={handleDOBChange} 
                required 
              />
              <input 
                type="text" 
                name="age" 
                value={formData.age} 
                readOnly 
                placeholder="Age (Auto)" 
              />
              <div className="form-group">
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="Contact Number (10 digits) *"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  className={errors.contactNumber ? "error" : ""}
                />
                {errors.contactNumber && (
                  <span className="error-message">{errors.contactNumber}</span>
                )}
              </div>
              <div className="form-group">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Email *" 
                  value={formData.email}
                  onChange={handleChange} 
                  required
                  className={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>
              <div className="form-group">
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Password (min 8 characters) *" 
                  value={formData.password}
                  onChange={handleChange} 
                  required
                  className={errors.password ? "error" : ""}
                />
                {errors.password && (
                  <span className="error-message">{errors.password}</span>
                )}
              </div>
              <input 
                type="file" 
                onChange={handleFileUpload} 
                accept="image/*" 
              />
            </div>

            {userType === "patient" ? (
              <div className="form-section">
                <h3>Medical Information</h3>
                <select 
                  name="bloodGroup" 
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <div className="form-group">
                  <input
                    type="tel"
                    name="emergencyContact"
                    placeholder="Emergency Contact Number (10 digits)"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className={errors.emergencyContact ? "error" : ""}
                  />
                  {errors.emergencyContact && (
                    <span className="error-message">{errors.emergencyContact}</span>
                  )}
                </div>
                <textarea 
                  name="allergies" 
                  placeholder="Known Allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                ></textarea>
                <textarea 
                  name="medication" 
                  placeholder="Current Medication"
                  value={formData.medication}
                  onChange={handleChange}
                ></textarea>
                <textarea 
                  name="medicalHistory" 
                  placeholder="Medical History Summary"
                  value={formData.medicalHistory}
                  onChange={handleChange}
                ></textarea>
              </div>
            ) : (
              <div className="form-section">
                <h3>Professional Information</h3>
                <select 
                  name="specialization" 
                  value={formData.specialization}
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Specialization *</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                <div className="form-group">
                  <input
                    type="text"
                    name="licenseNumber"
                    placeholder="Medical License Number (10 digits) *"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    className={errors.licenseNumber ? "error" : ""}
                  />
                  {errors.licenseNumber && (
                    <span className="error-message">{errors.licenseNumber}</span>
                  )}
                </div>
                <div className="form-group">
                  <input 
                    type="number" 
                    name="experience" 
                    placeholder="Years of Experience*"
                    value={formData.experience}
                    onChange={handleChange}
                    min="1"
                    max="99"
                    required
                    className={errors.experience ? "error" : ""}
                  />
                  {errors.experience && (
                    <span className="error-message">{errors.experience}</span>
                  )}
                </div>
                <input 
                  type="text" 
                  name="hospital" 
                  placeholder="Hospital/Clinic Name"
                  value={formData.hospital}
                  onChange={handleChange} 
                />
              </div>
            )}

            <div className="button-group">
              <button type="submit" className="submit-button">
                {userType === "patient" ? "Register as Patient" : "Register as Doctor"}
              </button>
              <button 
                type="button" 
                onClick={handleBackToLogin} 
                className="back-button"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>

        <div className="signup-image-container" style={{ 
          backgroundImage: userType === "patient" 
            ? `url(${logoImage2})` 
            : `url(${register5})`
        }}>
        </div>
      </div>
    </div>
  );
};

export default Signup;
