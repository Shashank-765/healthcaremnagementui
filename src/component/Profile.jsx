import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../patient/PatientDashboard.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';

const Profile = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Dummy data for profile
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    age: 35,
    bloodGroup: "O+",
    contact: "+1234567890",
    email: "john.doe@example.com",
    address: "123 Healthcare St, Medical City, MC 12345"
  });

  const handleLogout = () => {
    navigate('/');
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

  const handleSaveClick = () => {
    setIsEditing(false);
    // Here you would typically save the changes to your backend
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      {/* Main Content */}
      <div className="main-content">
        <Navbar />
        {/* Profile Card */}
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
                        name="name"
                        value={profileData.name} 
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
                </div>
                <div className="form-row">
                  <div className="form-group col-md-12">
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
                <div className="form-group">
                  <label>Address</label>
                  <div className="input-group">
                    <textarea
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                    />
                    {isEditing && (
                      <button className="edit-field-btn" type="button">
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
  );
};

export default Profile; 