import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../patient/PatientDashboard.css';
import logoImage from '../image/logo.png';
// import { FaBell } from 'react-icons/fa';
import axios from 'axios';
import Pusher from 'pusher-js';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Initialize Pusher
const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY || 'your_pusher_key', {
  cluster: process.env.REACT_APP_PUSHER_CLUSTER || 'your_cluster',
  encrypted: true
});

const Navbar = ({ toggleSidebar, isSidebarOpen, onToggleSidebar }) => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  const fetchNotifications = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.token) {
        console.error('No token found in userData');
        return;
      }
      console.log('Fetching notifications with token for user:', userData);
      const response = await axios.get(`${API_URL}/notification/getnotifications`, {
        headers: { 
          'Authorization': `Bearer ${userData.token.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Notifications response:', response.data);
      
      if (response.data && response.data.success) {
        const notificationsData = response.data.notifications || [];
        console.log('Setting notifications:', notificationsData);
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.read).length);
      } else {
        console.log('No notifications found or error in response');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    // Only fetch notifications if user is logged in
    if (userData && userData.token) {
      console.log('Fetching notifications for user:', userData);
      fetchNotifications();
    }

    let channel = null;
    if (userData && userData.token) {
      const channelName = `notifications-${userData.fullName || userData.name}`;
      console.log('User details:', {
        name: userData.fullName || userData.name,
        role: userData.role,
        email: userData.email
      });
      console.log('Subscribing to Pusher channel:', channelName);
      
      channel = pusher.subscribe(channelName);
      
      channel.bind('new-notification', (data) => {
        console.log('New notification received:', data);
        console.log('Current user details:', {
          name: userData.fullName || userData.name,
          role: userData.role,
          email: userData.email
        });
        console.log('Notification recipient:', data.notification?.recipientId);
        
        if (data.notification) {
          // Add notification if it's for this user
          if (data.notification.recipientId === (userData.fullName || userData.name)) {
            console.log('Adding notification for this user:', data.notification);
            setNotifications(prev => {
              const newNotifications = [data.notification, ...prev];
              setUnreadCount(prev => prev + 1);
              return newNotifications;
            });
          } else {
            console.log('Notification is for a different user:', {
              notificationRecipient: data.notification.recipientId,
              currentUser: userData.fullName || userData.name
            });
          }
        }
      });

      // Log connection status
      pusher.connection.bind('connected', () => {
        console.log('Connected to Pusher');
      });

      pusher.connection.bind('error', (err) => {
        console.error('Pusher connection error:', err);
      });
    } else {
      console.log('Not setting up Pusher subscription because:', {
        hasUserData: !!userData,
        hasToken: !!userData?.token,
        hasName: !!(userData?.fullName || userData?.name)
      });
    }

    // Cleanup function
    return () => {
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
    };
  }, []); // Empty dependency array means this runs only once on mount

  const markAsRead = async (notificationId) => {
    try {
      if (!userData || !userData.token) {
        console.error('No token found in userData');
        return;
      }
      await axios.put(`${API_URL}/notification/markAsRead/${notificationId}`, {}, {
        headers: { 
          'Authorization': `Bearer ${userData.token.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!userData || !userData.token) {
        console.error('No token found in userData');
        return;
      }
      await axios.put(`${API_URL}/notification/markAllAsRead`, {}, {
        headers: { 
          'Authorization': `Bearer ${userData.token.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleToggle = () => {
    if (toggleSidebar) {
      toggleSidebar();
    } else if (onToggleSidebar) {
      onToggleSidebar();
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      // Only mark notifications as read when opening the dropdown
      markAllAsRead();
    }
  };

  const handleViewAllNotifications = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.token) {
        console.error('No token found in userData');
        return;
      }
      console.log('Fetching all notifications with token for user:', userData);
      
      // First try to get notifications from the dropdown endpoint
      const response = await axios.get(`${API_URL}/notification/getnotifications`, {
        headers: { 
          'Authorization': `Bearer ${userData.token.trim()}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Notifications response:', response.data);
      
      if (response.data && response.data.success) {
        const notificationsData = response.data.notifications || [];
        console.log('Setting notifications:', notificationsData);
        setNotifications(notificationsData);
        setUnreadCount(response.data.unreadCount);
      } else {
        console.log('No notifications found or error in response');
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      setNotifications([]);
      setUnreadCount(0);
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
        <div className="notification-container">
          <div 
            className="notification-bell" 
              onClick={handleNotificationClick}
            >
            <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
          </div>

          {showNotifications && (
              <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
              </div>

              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                      <div 
                        key={notification._id} 
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">
                    No notifications
                  </div>
                )}
              </div>

              <Link 
                to="/notifications" 
                className="view-all-notifications"
                onClick={() => {
                  setShowNotifications(false);
                  handleViewAllNotifications();
                }}
              >
                View all notifications
              </Link>
          </div>
        )}
        </div>

        <div className="user-profile-dropdown">
          <div 
            className="user-icon"
            onClick={handleUserClick}
          >
            <i className="fas fa-user"></i>
          </div>

          {showUserDropdown && (
            <div className="user-dropdown-menu">
              <Link to="/profile" className="dropdown-item">
                <i className="fas fa-user-circle"></i>
                Profile
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item">
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar; 