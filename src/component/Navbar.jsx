import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../patient/PatientDashboard.css';
import logoImage from '../image/logo.png';

const Navbar = ({ toggleSidebar, isSidebarOpen, onToggleSidebar }) => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    navigate('/');
  };

  // Handle both types of toggle functions
  const handleToggle = () => {
    if (toggleSidebar) {
      toggleSidebar();
    } else if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <div className="mobile-toggle" onClick={handleToggle}>
          <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
        </div>
        <div className="navbar-logo">
          <img src={logoImage} alt="Hospital Logo" className="nav-logo" />
        </div>
      </div>
      <div className="navbar-right">
        <div className="user-menu">
          <div className="user-icon" onClick={handleUserClick}>
            <i className="fas fa-user-circle"></i>
          </div>
          {showUserDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-item" onClick={() => navigate('/profile')}>
                <i className="fas fa-user"></i>
                Profile
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar; 