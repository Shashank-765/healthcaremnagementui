import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../patient/PatientDashboard.css';
import logoImage from '../image/logo.png';

const Sidebar = ({ isSidebarOpen, toggleSidebar, isSubmenuOpen }) => {
  const navigate = useNavigate();
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [activeItem, setActiveItem] = useState('dashboard');

  const getUserRole = () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || !userData.token) {
      return null;
    }
    return userData.role;
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleDashboardClick = () => {
    const role = getUserRole();
    if (!role) {
      navigate('/');
      return;
    }
    setActiveItem('dashboard');
    navigate(role === 'patient' ? '/patient-dashboard' : '/doctor-dashboard');
  };

  const handleAppointmentClick = () => {
    setIsAppointmentOpen(!isAppointmentOpen);
    setActiveItem('appointments');
  };

  const handleSubmenuClick = (path) => {
    const role = getUserRole();
    if (!role) {
      navigate('/');
      return;
    }
    if (role === 'patient') {
      setActiveItem(path === '/book-appointment' ? 'book-appointment' : 'all-appointments');
      navigate(path);
    } else if (role === 'doctor' && path === '/total-appointments') {
      setActiveItem('total-appointments');
      navigate(path);
    }
  };

  const handleMedicalHistoryClick = () => {
    const role = getUserRole();
    if (!role) {
      navigate('/');
      return;
    }
    setActiveItem('medical');
    navigate('/medical-history');
  };

  const handlePatientHistoryClick = () => {
    const role = getUserRole();
    if (!role) {
      navigate('/');
      return;
    }
    setActiveItem('patient-history');
    navigate('/doctor-dashboard/patient-history');
  };

  useEffect(() => {
    if (isSubmenuOpen) {
      setIsAppointmentOpen(true);
    }
  }, [isSubmenuOpen]);

  const userRole = getUserRole();

  return (
    <div className={`sidebar ${isSidebarOpen ? 'expanded' : 'collapsed'}`} ref={sidebarRef}>
      <div className="logo-container">
        <img src={logoImage} alt="Hospital Logo" />
        <h4>Dashboard</h4>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {/* Dashboard Item */}
          <li>
            <div 
              className={`menu-item ${activeItem === 'dashboard' ? 'expanded' : ''}`}
              onClick={handleDashboardClick}
            >
              <div className="menu-title">
                <i className="fas fa-th-large"></i>
                <span>Dashboard</span>
              </div>
            </div>
          </li>

          {/* Appointments Item with Submenu */}
          <li>
            <div 
              className={`menu-item ${isAppointmentOpen ? 'expanded' : ''}`}
              onClick={handleAppointmentClick}
            >
              <div className="menu-title">
                <i className="fas fa-calendar-alt"></i>
                <span>Appointments</span>
                <i className={`fas fa-chevron-${isAppointmentOpen ? 'down' : 'right'} submenu-arrow`}></i>
              </div>
            </div>
            {isAppointmentOpen && (
              <ul className="submenu">
                {userRole === 'patient' ? (
                  <>
                    <li 
                      onClick={() => handleSubmenuClick('/all-appointments')}
                      className={`submenu-item ${activeItem === 'all-appointments' ? 'active' : ''}`}
                    >
                      <i className="fas fa-list-alt"></i>
                      All Appointments
                    </li>
                    <li 
                      onClick={() => handleSubmenuClick('/book-appointment')}
                      className={`submenu-item ${activeItem === 'book-appointment' ? 'active' : ''}`}
                    >
                      <i className="fas fa-calendar-plus"></i>
                      Book Appointment
                    </li>
                  </>
                ) : (
                  <>
                    <li 
                      onClick={() => handleSubmenuClick('/total-appointments')}
                      className="submenu-item"
                    >
                      <i className="fas fa-list-alt"></i>
                      Total Appointments
                    </li>
                  </>
                )}
              </ul>
            )}
          </li>

          {/* Medical/Patient History Item */}
          <li>
            <div 
              className={`menu-item ${activeItem === (userRole === 'patient' ? 'medical' : 'patient-history') ? 'expanded' : ''}`}
              onClick={userRole === 'patient' ? handleMedicalHistoryClick : handlePatientHistoryClick}
            >
              <div className="menu-title">
                <i className={userRole === 'patient' ? 'fas fa-notes-medical' : 'fas fa-history'}></i>
                <span>{userRole === 'patient' ? 'Medical History' : 'Patient History'}</span>
              </div>
            </div>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        {userRole === 'admin' && (
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 