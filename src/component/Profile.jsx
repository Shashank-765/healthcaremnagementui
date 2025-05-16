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

  // Profile data state
  const [profileData, setProfileData] = useState({
    fullName: "",
    age: "",
    contact: "",
    email: "",
    bloodGroup: "",
    specialization: ""
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      if (!userData || !userData.token) {
        setError("No authentication token found. Please login again.");
        navigate('/login');
        return;
      }

      console.log('Fetching profile data...');
      console.log('API URL:', `${API_URL}/patient/profile-view`);
      
      const response = await axios.get(`${API_URL}/patient/profile-view`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      console.log('Profile API Response:', response.data);

      if (response.data.success) {
        setProfileData(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch profile data");
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('userData');
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError("Profile not found. Please contact support.");
      } else {
        setError(err.response?.data?.message || "Error fetching profile data. Please try again later.");
      }
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
      const userData = JSON.parse(localStorage.getItem('userData'))
      // TODO: Implement update profile API call here
      // const response = await axios.put(`${API_URL}/patient/updateprofile`, profileData, {
      //   headers: {
      //     Authorization: `Bearer ${token}`
      //   }
      // });
      
      setIsEditing(false);
      // Refresh profile data after update
      await fetchProfileData();
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
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
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      {!isEditing && (
                        <button className="edit-field-btn" onClick={handleEditClick}>
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="form-group col-md-6">
                    <label>Age</label>
                    <div className="input-group">
                      <input 
                        type="number" 
                        name="age"
                        value={profileData.age} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      {!isEditing && (
                        <button className="edit-field-btn" onClick={handleEditClick}>
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-row">
                  {profileData.bloodGroup && (
                    <div className="form-group col-md-6">
                      <label>Blood Group</label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          name="bloodGroup"
                          value={profileData.bloodGroup} 
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                        {!isEditing && (
                          <button className="edit-field-btn" onClick={handleEditClick}>
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {profileData.specialization && (
                    <div className="form-group col-md-6">
                      <label>Specialization</label>
                      <div className="input-group">
                        <input 
                          type="text" 
                          name="specialization"
                          value={profileData.specialization} 
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
                        {!isEditing && (
                          <button className="edit-field-btn" onClick={handleEditClick}>
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
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
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      {!isEditing && (
                        <button className="edit-field-btn" onClick={handleEditClick}>
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="form-group col-md-6">
                    <label>Email</label>
                    <div className="input-group">
                      <input 
                        type="email" 
                        name="email"
                        value={profileData.email} 
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                      {!isEditing && (
                        <button className="edit-field-btn" onClick={handleEditClick}>
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
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