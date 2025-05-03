import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/AdminDashboard.css';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:5000/api/v1';

const InsuranceDashboard = () => {
    const navigate = useNavigate();
    const [expandedItem, setExpandedItem] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [showViewPopup, setShowViewPopup] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showAccessRequestPopup, setShowAccessRequestPopup] = useState(false);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await fetch(`${API_URL}/insurance/patients`, {
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setPatients(data.data);
            } else {
                console.error('Failed to fetch patients');
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleViewAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setShowViewPopup(true);
    };

    const handleAccessRequest = async (patient) => {
        try {
            const response = await fetch(`${API_URL}/insurance/request-access`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientId: patient.patientId
                })
            });
            
            if (response.ok) {
                alert('Access request sent successfully');
                fetchPatients(); // Refresh the data
            } else {
                alert('Failed to send access request');
            }
        } catch (error) {
            console.error('Error sending access request:', error);
            alert('Error sending access request');
        }
    };

    const handleVerificationToggle = async (patientId) => {
        try {
            const response = await fetch(`${API_URL}/insurance/verify-patient/${patientId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${Cookies.get('token')}`
                }
            });
            
            if (response.ok) {
                fetchPatients(); // Refresh the data
            } else {
                console.error('Failed to update verification status');
            }
        } catch (error) {
            console.error('Error updating verification:', error);
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
                <div className="stats-grid-insurance">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Total Patients</h5>
                            <div className="small-card-icon">
                                <i className="fas fa-wheelchair"></i>
                            </div>
                            <p className="card-text">Total number of patients covered.lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</p>
                            <h4>{patients.length}</h4>
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
                            ) : patients.map((patient) => (
                                <tr key={patient.patientId}>
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
                                                <input
                                                    type="checkbox"
                                                    checked={patient.isVerified}
                                                    onChange={() => handleVerificationToggle(patient.patientId)}
                                                    title="Verify Insurance"
                                                />
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
                                <h3>Patient Details</h3>
                                <button className="close-btn" onClick={() => setShowViewPopup(false)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="popup-body">
                                <div className="patient-details">
                                    <p><strong>Name:</strong> {selectedAppointment.patient?.name || 'N/A'}</p>
                                    <p><strong>Phone:</strong> {selectedAppointment.patient?.phone || 'N/A'}</p>
                                    <p><strong>Email:</strong> {selectedAppointment.patient?.email || 'N/A'}</p>
                                    <p><strong>Insurance Status:</strong> {selectedAppointment.isVerified ? 'Verified' : 'Not Verified'}</p>
                                    <div className="medical-history">
                                        <h4>Medical History</h4>
                                        {selectedAppointment.medicalHistory?.map((history, index) => (
                                            <div key={index} className="history-item">
                                                <p><strong>Condition:</strong> {history.condition}</p>
                                                <p><strong>Notes:</strong> {history.notes}</p>
                                                <p><strong>Date:</strong> {new Date(history.date).toLocaleDateString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InsuranceDashboard;