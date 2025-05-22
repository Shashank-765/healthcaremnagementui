// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// const Notifications = () => {
//   const [notifications, setNotifications] = useState([]);
//   const userData = JSON.parse(localStorage.getItem('userData'));

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/notification/getnotifications`, {
//           headers: {
//             'Authorization': `Bearer ${userData.token}`
//           }
//         });
//         if (response.data.success) {
//           setNotifications(response.data.notifications);
//         }
//       } catch (error) {
//         console.error('Error fetching notifications:', error);
//       }
//     };
//     fetchNotifications();
//   }, [userData.token]);

//   // Optionally, mark all as read when this page loads
//   useEffect(() => {
//     const markAllAsRead = async () => {
//       try {
//         await axios.put(`${API_URL}/notification/markAllAsRead`, {}, {
//           headers: {
//             'Authorization': `Bearer ${userData.token}`
//           }
//         });
//       } catch (error) {
//         // handle error
//       }
//     };
//     markAllAsRead();
//   }, [userData.token]);

//   return (
//     <div>
//       <h2>All Notifications</h2>
//       {notifications.length === 0 ? (
//         <p>No notifications found.</p>
//       ) : (
//         notifications.map((notification) => (
//           <div key={notification._id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
//             <div className="notification-title">{notification.title}</div>
//             <div className="notification-message">{notification.message}</div>
//             <div className="notification-time">{new Date(notification.createdAt).toLocaleString()}</div>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default Notifications;
