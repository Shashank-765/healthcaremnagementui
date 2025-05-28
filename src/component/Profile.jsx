import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../patient/PatientDashboard.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const Profile = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData = JSON.parse(localStorage.getItem('userData'));

  console.log('User Role from localStorage:', userData?.role); // Debug log

  // Add CSS styles for read-only fields
  const readOnlyStyle = {
    cursor: 'not-allowed',
    pointerEvents: 'none',
    backgroundColor: '#f5f5f5',
    opacity: '0.8'
  };
 const emergencyContactStyle = {
    backgroundColor: isEditing ? '#ffffff' : '#f5f5f5'
  };

  const [profileData, setProfileData] = useState({
    fullName: "",
    age: "",
    contact: "",
    email: "",
    bloodGroup: "",
    specialization: "",
    emergencyContact: "",
    emergencyContacts: []
  });
  const [userRole, setUserRole] = useState("");
  useEffect(() => {
    if (!userData || !userData.token) {
      setError("No authentication token found. Please login again.");
      navigate('/login');
      return;
    }
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/patient/profile-view`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      console.log('Profile API Response:', response.data);

      if (response.data.success) {
        setProfileData(prev => ({
          ...response.data.data,
          emergencyContact: response.data.data.emergencyContact || '',
          emergencyContacts: response.data.data.emergencyContacts || []
        }));
      } else {
        setError(response.data.message || "Failed to fetch profile data");
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.response?.data?.message || "Error fetching profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      // Validate emergency contact before sending
      if (profileData.emergencyContact.length !== 10) {
        setError("Emergency contact must be exactly 10 digits");
        return;
      }
      
      const updateData = {
        emergencyContact: profileData.emergencyContact
      };
      
      const response = await axios.put(`${API_URL}/patient/update-emergency-contact`, updateData, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });
      
      if (response.data.success) {
        setIsEditing(false);
        setProfileData(prev => ({
          ...prev,
          emergencyContacts: response.data.data.emergencyContacts
        }));
      } else {
        setError(response.data.message || "Error updating emergency contact");
      }
    } catch (err) {
      console.error('Error updating emergency contact:', err);
      setError(err.response?.data?.message || "Error updating emergency contact");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'emergencyContact') {
      // Only allow numbers and max 10 digits
      if (value.length <= 10 && /^\d*$/.test(value)) {
        setProfileData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const renderEmergencyContacts = () => {
    if (!profileData.emergencyContacts?.length) return null;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="loading">Loading profile data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <i className="fas fa-user-circle"></i>
              Profile
            </h3>
            {!isEditing ? (
              <button className="edit-btn" onClick={handleEditClick}>
                <i className="fas fa-edit"></i>
                Edit Profile
              </button>
            ) : (
              <button className="save-btn" onClick={handleSaveClick}>
                <i className="fas fa-save"></i>
                Save Changes
              </button>
            )}
          </div>
          <div className="card-content">
            <div className="profile-section">
              <div className="profile-image-section">
                <div className="profile-image">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                </div>
                <div className="upload-section">
                  <label className="upload-btn">
                    <i className="fas fa-camera"></i> Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Full Name</label>
                    <div className="input-group">
                      <input 
                        type="text" 
                        name="fullName"
                        value={profileData.fullName} 
                        disabled={true}
                        style={readOnlyStyle}
                      />
                    </div>
                  </div>
                  <div className="form-group col-md-6">
                    <label>Age</label>
                    <div className="input-group">
                      <input 
                        type="number" 
                        name="age"
                        value={profileData.age} 
                        disabled={true}
                        style={readOnlyStyle}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Emergency Contact</label>
                    <div className="input-group">
                      <input 
                        type="tel" 
                        name="emergencyContact"
                        value={profileData.emergencyContact} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        style={emergencyContactStyle}
                        maxLength={10}
                        pattern="[0-9]{10}"
                        title="Please enter exactly 10 digits"
                        placeholder="Enter 10 digit number"
                      />
                      {!isEditing && (
                        <button className="edit-btn" onClick={handleEditClick}>
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                    </div>
                    {isEditing && profileData.emergencyContact && profileData.emergencyContact.length !== 10 && (
                      <small className="text-danger">
                        Emergency contact must be exactly 10 digits
                      </small>
                    )}
                    {renderEmergencyContacts()}
                  </div>
                  {userData?.role === 'patient' && (
                    <div className="form-group col-md-6">
                      <label>Blood Group</label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          name="bloodGroup"
                          value={profileData.bloodGroup || ''} 
                          disabled={true}
                          style={readOnlyStyle}
                        />
                      </div>
                    </div>
                  )}
                  {userData?.role === 'doctor' && (
                    <div className="form-group col-md-6">
                      <label>Specialization</label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          name="specialization"
                          value={profileData.specialization || ''} 
                          disabled={true}
                          style={readOnlyStyle}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group col-md-6">
                    <label>Contact</label>
                    <div className="input-group">
                      <input 
                        type="tel" 
                        name="contact"
                        value={profileData.contact} 
                        disabled={true}
                        style={readOnlyStyle}
                      />
                    </div>
                  </div>
                  <div className="form-group col-md-6">
                    <label>Email</label>
                    <div className="input-group">
                      <input 
                        type="email" 
                        name="email"
                        value={profileData.email} 
                        disabled={true}
                        style={readOnlyStyle}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 