import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../patient/PatientDashboard.css';
import logoImage from '../image/logo.png';
// import { FaBell } from 'react-icons/fa';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const Navbar = ({ toggleSidebar, isSidebarOpen, onToggleSidebar }) => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    console.log('1. Navbar mounted, checking for notifications...');
    const userData = JSON.parse(localStorage.getItem('userData'));
    console.log('2. User data:', userData);

    if (userData?.role === 'doctor') {
      console.log('3. User is a doctor, fetching notifications...');
      // fetchNotifications();
    }
  }, []);

  // const fetchNotifications = async () => {
  //   try {
  //     console.log('4. Fetching notifications...');
  //     const userData = JSON.parse(localStorage.getItem('userData'));
  //     if (!userData?.token) {
  //       console.error('5. No user token found');
  //       return;
  //     }

  //      console.log('With headers:', {
  //       'Authorization': `Bearer ${userData.token}`
  //     });

  //     const response = await axios.get(`${API_URL}/notification/getnotifications`, {
  //       headers: {
  //         'Authorization': `Bearer ${userData.token}`
  //       }
  //     });

  //     console.log('6. Notifications response:', response.data);

  //     if (response.data.success) {
  //       console.log('7. Setting notifications:', response.data.notifications);
  //       setNotifications(response.data.notifications);
  //       setUnreadCount(response.data.unreadCount);
  //     }
  //   } catch (error) {
  //     console.error('8. Error fetching notifications:', error);
  //     console.error('Error details:', {
  //       message: error.message,
  //       status: error.response?.status,
  //       data: error.response?.data,
  //       config: {
  //         url: error.config?.url,
  //         method: error.config?.method,
  //         headers: error.config?.headers
  //       }
  //     });
  //   }
  // };

  // const handleNotificationClick = () => {
  //   setShowNotificationDropdown(!showNotificationDropdown);
  //   setShowUserDropdown(false);
  // };

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
    // setShowNotificationDropdown(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/');
  };

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
        {JSON.parse(localStorage.getItem('userData'))?.role === 'doctor' && (
          <div className="notification-menu">
            {/* <div 
              className="notification-icon" 
              onClick={handleNotificationClick}
              style={{ position: 'relative' }}
            >
              <FaBell style={{ fontSize: '20px' }} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div> */}
            {/* {showNotificationDropdown && (
              <div className="notification-dropdown">
                {notifications.length > 0 ? (
                  <>
                    {notifications.slice(0, 4).map((notification) => (
                      <div 
                        key={notification._id} 
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                        // onClick={() => handleNotificationItemClick(notification._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-time">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    <div 
                      className="notification-item view-more" 
                      style={{ textAlign: 'center', color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => navigate('/notifications')}
                    >
                      View More
                    </div>
                  </>
                ) : (
                  <div className="notification-item">No notifications</div>
                )}
              </div>
            )} */}
          </div>
        )}
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