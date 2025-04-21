import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './bookAppointment.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import BookAppointmentForm from './BookAppointmentForm';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1251) {
        // Always show sidebar on large screens
        setIsSidebarOpen(true);
      } else {
        // Default to closed sidebar on smaller screens
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <button className="mobile-toggle" onClick={toggleSidebar}>
        <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
      </button>

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isSubmenuOpen={true}
      />
      
      <div className={`main-content3 ${isSidebarOpen ? 'content-shifted' : ''}`}>
        <Navbar 
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        
        <div className="content-wrapper">
          <div className="admin-banner-patient" style={{ backgroundImage: `url(${bannerImage})` }}>
            <div className="banner-content">
              <div className="doctor-profile-book">
                <img src={doctorImage} alt="Doctor" />
              </div>
              <h1>YOUR HEALTH IS<br />OUR PRIORITY</h1>
            </div>
          </div>
          
          <div className="dashboard-card">
            <div className="card-header">
              <h3>
                <i className="fas fa-calendar-plus"></i>
                Book Appointment
              </h3>
            </div>
            <div className="card-content">
              <BookAppointmentForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment; 