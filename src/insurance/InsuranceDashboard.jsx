import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/AdminDashboard.css';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import correct from '../image/correct1.jpg';
import Cookies from 'js-cookie';
import useInsurancePatients from './useInsurancePatients';

const InsuranceDashboard = () => {
    const navigate = useNavigate();
    const [expandedItem, setExpandedItem] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Use the custom hook
    const {
        patients,
        loading,
        stats,
        handleAccessRequest,
        handleVerificationToggle,
        handleViewPatient
    } = useInsurancePatients();

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
            id: 'patientslist',
            icon: 'fas fa-user-injured',
            label: 'patients list',
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

    const handleViewAppointment = async (patient) => {
        const patientWithHistory = await handleViewPatient(patient);
        if (patientWithHistory) {
            setSelectedAppointment(patientWithHistory);
            setShowViewPopup(true);
        }
    };

    const handleViewMore = () => {
        navigate('/insurance/patient-list');
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
                <div className="stats-grid-insurance" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    padding: '2rem'
                }}>
                    <div className="card" style={{
                        width: '300px',
                        height: '200px',
                        borderRadius: '15px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                        cursor: 'pointer',
                        backgroundColor: '#fff'
                    }}>
                        <div className="card-body" style={{
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
                        }}>
                            <h5 className="card-title" style={{
                                fontSize: '1.2rem',
                                marginBottom: '1rem',
                                color: '#333'
                            }}>Total Medical Patients</h5>
                            <div className="small-card-icon" style={{
                                fontSize: '2rem',
                                color: '#007bff',
                                marginBottom: '1rem'
                            }}>
                                <i className="fas fa-wheelchair"></i>
                            </div>
                            <h4 style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#007bff',
                                margin: 0
                            }}>{stats.totalPatients}</h4>
                        </div>
                    </div>
                    <div className="card" style={{
                        width: '300px',
                        height: '200px',
                        borderRadius: '15px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                        cursor: 'pointer',
                        backgroundColor: '#fff'
                    }}>
                        <div className="card-body" style={{
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
                        }}>
                            <h5 className="card-title" style={{
                                fontSize: '1.2rem',
                                marginBottom: '1rem',
                                color: '#333'
                            }}>Verified Insurance Patients</h5>
                            <div className="small-card-icon" style={{
                                fontSize: '2rem',
                                color: '#28a745',
                                marginBottom: '1rem'
                            }}>
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <h4 style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#28a745',
                                margin: 0
                            }}>{stats.insuredPatients}</h4>
                        </div>
                    </div>
                    <div className="card" style={{
                        width: '300px',
                        height: '200px',
                        borderRadius: '15px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease',
                        cursor: 'pointer',
                        backgroundColor: '#fff'
                    }}>
                        <div className="card-body" style={{
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%'
                        }}>
                            <h5 className="card-title" style={{
                                fontSize: '1.2rem',
                                marginBottom: '1rem',
                                color: '#333'
                            }}>Restrict Insurance Patients</h5>
                            <div className="small-card-icon" style={{
                                fontSize: '2rem',
                                color: '#dc3545',
                                marginBottom: '1rem'
                            }}>
                                <i className="fas fa-user-lock"></i>
                            </div>
                            <h4 style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#dc3545',
                                margin: 0
                            }}>{stats.totalPatients - stats.insuredPatients}</h4>
                        </div>
                    </div>
                </div>

                {/* Patients Table */}
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
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="loading-cell">Loading...</td>
                                </tr>
                            ) : patients.slice(0, 3).map((patient) => (
                                <tr key={patient.patientId || patient._id}>
                                    <td>{patient.name || 'N/A'}</td>
                                    <td>{patient.phone || 'N/A'}</td>
                                    <td>{patient.email || 'N/A'}</td>
                                    <td>
                                        <div className="table-actions">
                                            <button 
                                                className="action-btn view" 
                                                title="View Details"
                                                onClick={() => handleViewAppointment(patient)}
                                            >
                                                <i className="fas fa-eye"></i>
                                            </button>
                                            <button
                                                className="action-btn request"
                                                title="Request Access"
                                                onClick={() => handleAccessRequest(patient)}
                                                disabled={patient.hasAccess}
                                            >
                                                <i className="fas fa-hand-paper"></i>
                                            </button>
                                            <div className="verification-checkbox">
                                                {patient.isVerified ? <img src={correct} width="30px" height="30px"/> :<input
                                                    type="checkbox"
                                                    checked={patient.isVerified}
                                                    onChange={() => handleVerificationToggle(patient)}
                                                    title="Verify Insurance"
                                                />}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="view-more-container">
                        <button className="view-more-btn" onClick={handleViewMore}>
                            View More Patients <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>

                {/* View Popup */}
                {showViewPopup && selectedAppointment && (
                    <div className="popup-overlay">
                        <div className="popup-content">
                            <div className="popup-header">
                                <h3>Patient Medical History</h3>
                                <button className="close-btn" onClick={() => setShowViewPopup(false)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="popup-body">
                                {loading ? (
                                    <div className="loading-spinner">Loading...</div>
                                ) : selectedAppointment.medicalHistory?.length > 0 ? (
                                    <table className="medical-history-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Doctor</th>
                                                <th>Condition</th>
                                                <th>Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedAppointment.medicalHistory.map((record, index) => (
                                                <tr key={index}>
                                                    <td>{new Date(record.date).toLocaleDateString()}</td>
                                                    <td>{record.doctorName}</td>
                                                    <td>{record.condition}</td>
                                                    <td>{record.notes}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No medical history available</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InsuranceDashboard;