import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './notifications.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
          console.error('No user data or token found');
          navigate('/');
          return;
        }

        console.log('Fetching all notifications for user:', {
          name: userData.fullName || userData.name,
          role: userData.role,
          email: userData.email
        });

        // Use getnotifications endpoint for the notifications page
        const response = await axios.get(`${API_URL}/notification/getnotifications`, {
          headers: {
            'Authorization': `Bearer ${userData.token.trim()}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Notifications response:', response.data);

        if (response.data.success) {
          const notificationsData = response.data.notifications || [];
          console.log('Setting all notifications:', notificationsData);
          setNotifications(notificationsData);
        } else {
          console.error('Failed to fetch notifications:', response.data.message);
          setError(response.data.message || 'Failed to fetch notifications');
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        if (err.response) {
          console.error('Error response:', err.response.data);
        }
        setError('Error loading notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate]);

  const markAsRead = async (notificationId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData.token) {
        console.error('No user data or token found');
        return;
      }

      console.log('Marking notification as read:', notificationId);

      const response = await axios.put(
        `${API_URL}/notification/markAsRead/${notificationId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${userData.token.trim()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Mark as read response:', response.data);

      if (response.data.success) {
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.title === 'New Medical History') {
      return 'fa-file-medical';
    } else if (notification.title === 'New Appointment Request') {
      return 'fa-calendar-check';
    } else if (notification.title === 'Appointment Status Update') {
      return 'fa-calendar-alt';
    } else if (notification.title === 'New Review Received') {
      return 'fa-star';
    } else if (notification.message?.includes('appointment status')) {
      return 'fa-calendar-alt';
    }
    return 'fa-bell';
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          Loading notifications...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <div className="no-notifications">
          <i className="fas fa-bell-slash"></i>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notification._id)}
            >
              <div className="notification-icon">
                <i className={`fas ${getNotificationIcon(notification)}`}></i>
              </div>
              <div className="notification-content">
                <h4 className="notification-title">{notification.title || 'Notification'}</h4>
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>
              {!notification.read && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
