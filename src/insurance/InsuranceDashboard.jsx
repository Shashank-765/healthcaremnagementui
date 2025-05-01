import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/AdminDashboard.css';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import Cookies from 'js-cookie';

const InsuranceDashboard = () => {
    const navigate = useNavigate();
    const [expandedItem, setExpandedItem] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');

    // Dummy data for appointments
    const confirmedAppointments = [
        {
            _id: '1',
            patient: {
                name: 'John Doe',
                phone: '555-0123',
                email: 'john.doe@example.com'
            }
        },
        {
            _id: '2',
            patient: {
                name: 'Jane Smith',
                phone: '555-0456',
                email: 'jane.smith@example.com'
            }
        },
        {
            _id: '3',
            patient: {
                name: 'Mike Johnson',
                phone: '555-0789',
                email: 'mike.johnson@example.com'
            }
        }
    ];

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const menuItems = [
        {
            id: 'dashboard',
            icon: 'fas fa-th-large',
            label: 'Dashboard',
            path: '/insurance/dashboard'
        },
        {
            id: 'patientlist',
            icon: 'fas fa-user-injured',
            label: 'patient list',
            path: '/insurance/patient-list'
        }
    ];

    const handleMenuClick = (item) => {
        if (item.submenu) {
            setExpandedItem(expandedItem === item.id ? null : item.id);
        } else {
            navigate(item.path);
        }
    };

    const handleViewAppointment = (appointment) => {
        navigate(`/insurance/appointment/${appointment._id}`, { state: { appointment } });
    };

    const handleLogout = () => {
        Cookies.remove('token');
        navigate('/insurance/login');
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="logo">
                    <img src={logoImage} alt="Hospital Logo" />
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                <div
                                    className={`menu-item ${expandedItem === item.id ? 'expanded' : ''}`}
                                    onClick={() => handleMenuClick(item)}
                                >
                                    <div className="menu-title">
                                        <i className={item.icon}></i>
                                        <span>{item.label}</span>
                                        {item.submenu && (
                                            <i className={`fas fa-chevron-${expandedItem === item.id ? 'down' : 'right'} submenu-arrow`}></i>
                                        )}
                                    </div>
                                </div>
                                {item.submenu && expandedItem === item.id && (
                                    <ul className="submenu">
                                        {item.submenu.map((subItem, index) => (
                                            <li
                                                key={index}
                                                onClick={() => navigate(subItem.path)}
                                                className="submenu-item"
                                            >
                                                {subItem.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <button className="sidebar-logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className={`admin-main ${isSidebarOpen ? '' : 'expanded'}`}>
                {/* Navbar with toggle */}
                <div className="navbar">
                    <div className="navbar-left">
                        <div className="mobile-toggle" onClick={toggleSidebar}>
                            <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
                        </div>
                        <div className="navbar-logo">
                            <img src={logoImage} alt="Hospital Logo" className="nav-logo" />
                        </div>
                    </div>
                    <div className="navbar-right">
                        <i className="fas fa-user-circle user-icon"></i>
                    </div>
                </div>

                {/* Banner */}
                <div className="admin-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
                    <div className="banner-content">
                        <div className="doctor-profile">
                            <img src={doctorImage} alt="Doctor" />
                        </div>
                        <h1>YOUR HEALTH IS<br />OUR PRIORITY</h1>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid-insurance">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Total Patients</h5>
                            <div className="small-card-icon">
                                <i className="fas fa-wheelchair"></i>
                            </div>
                            <p className="card-text">Total number of patients covered.lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                            <h4>{confirmedAppointments.length}</h4>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Total Insurance</h5>
                            <div className="small-card-icon">
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <p className="card-text">Active insurance policies.lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                            <h4>24</h4>
                        </div>
                    </div>
                </div>

                {/* Appointments Table */}
                <div className="appointments-table-container">
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Patient Name</th>
                                <th>Phone Number</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {confirmedAppointments.map(appointment => (
                                <tr key={appointment._id}>
                                    <td>{appointment.patient?.name || 'N/A'}</td>
                                    <td>{appointment.patient?.phone || 'N/A'}</td>
                                    <td>{appointment.patient?.email || 'N/A'}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button 
                                                className="action-btn view" 
                                                title="View Details"
                                                onClick={() => handleViewAppointment(appointment)}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InsuranceDashboard;