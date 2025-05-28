import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/AdminDashboard.css';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import correct from '../image/correct1.jpg';
import Cookies from 'js-cookie';
import useInsurancePatients from './useInsurancePatients';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
const InsurancePatientList = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAccessRequestPopup, setShowAccessRequestPopup] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showRequestSentPopup, setShowRequestSentPopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Use the custom hook
  const {
    patients,
    setPatients,
    loading,
    isSyncing,
    handleAccessRequest,
    handleVerificationToggle,
    handleViewPatient,
    syncMedicalData
  } = useInsurancePatients();

  const handleViewPatientDetails = async (patient) => {
    if (!patient.hasAccess) {
      return;
    }
    const patientWithHistory = await handleViewPatient(patient);
    if (patientWithHistory) {   
      setSelectedPatient(patientWithHistory);
      setShowViewPopup(true);
    }
  };

  const handleAccessRequestClick = (patient) => {
    if (patient.hasAccess) {
      alert('You already have access for this patient');
      return;
    }
    setSelectedPatient(patient);
    setShowAccessRequestPopup(true);
  };

  const handleVerifyClick = async (patient) => {
    try {
      await handleVerificationToggle(patient);
      // Update the patients list with the verified patient
      setPatients(prevPatients => 
        prevPatients.map(p => 
          p._id === patient._id || p.name === patient.name 
            ? { ...p, isVerified: true } 
            : p
        )
      );
    } catch (error) {
      console.error('Error during verification:', error);
      alert('Failed to verify patient. Please try again.');
      // Revert the checkbox state
      setPatients(prevPatients => 
        prevPatients.map(p => 
          p._id === patient._id || p.name === patient.name 
            ? { ...p, isVerified: false } 
            : p
        )
      );
    }
  };

  const handlePermissionToggle = async (patient) => {
    try {
      await handleAccessRequest(patient);
      setShowAccessRequestPopup(false);
    } catch (error) {
      if (error.response?.data?.message?.toLowerCase().includes('already pending')) {
        setShowRequestSentPopup(true);
      }
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    navigate('/insurance/login');
  };

  const filteredPatients = patients.filter(patient => {
    if (filter === 'withAccess') return patient.hasAccess;
    if (filter === 'withoutAccess') return !patient.hasAccess;
    return true;
  });

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
      label: 'patientslist',
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

        {/* Filter Section */}
        <div className="filter-section">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Patients</option>
            <option value="withAccess">With Access</option>
            <option value="withoutAccess">Without Access</option>
          </select>
        </div>

        {/* Patient List Table */}
        <div className="appointments-table-container">
          <h4>Patient List</h4>
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <>
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
                  {filteredPatients.map((patient) => (
                    <tr key={patient._id}>
                      <td>{patient.name}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.email}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className={`action-btn view ${!patient.hasAccess ? 'disabled' : ''}`}
                            title={patient.hasAccess ? "View Medical History" : "Request access first"}
                            onClick={() => handleViewPatientDetails(patient)}
                            disabled={!patient.hasAccess}
                            style={{ 
                              cursor: patient.hasAccess ? 'pointer' : 'not-allowed',
                              opacity: patient.hasAccess ? 1 : 0.5
                            }}
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className={`action-btn request ${patient.hasAccess || patient.requestPending ? 'disabled' : ''}`}
                            title={patient.hasAccess ? "Access Granted" : patient.requestPending ? "Request Already Sent" : "Request Access"}
                            onClick={() => {
                              if (patient.hasAccess) return;
                              if (patient.requestPending) {
                                setShowRequestSentPopup(true);
                                return;
                              }
                              handleAccessRequestClick(patient);
                            }}
                            disabled={patient.hasAccess || patient.requestPending}
                            style={{ 
                              cursor: patient.isVerified ? 'not-allowed' : 'pointer',
                              opacity: patient.isVerified ? 0.5 : 1
                            }}
                          >
                            <i className={`fas fa-hand-paper ${patient.hasAccess ? 'text-success' : ''}`}></i>
                          </button>
                          <div className="verification-checkbox">
                            {patient.isVerified ? (
                              <img 
                                src={correct} 
                                width="30px" 
                                height="30px" 
                                alt="Verified"
                                style={{ pointerEvents: 'none' }}
                              />
                            ) : (
                              <input
                                type="checkbox"
                                checked={patient.isVerified}
                                onChange={() => handleVerifyClick(patient)}
                                title={patient.hasAccess ? "Verify Insurance" : "Request access first"}
                                disabled={!patient.hasAccess || patient.isVerified}
                                style={{ 
                                  cursor: patient.hasAccess ? 'pointer' : 'not-allowed',
                                  opacity: patient.hasAccess ? 1 : 0.5
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add sync button at the bottom */}
              <div className="sync-container" style={{ marginTop: '20px', textAlign: 'right' }}>
                <button 
                  className="sync-btn" 
                  onClick={syncMedicalData}
                  disabled={isSyncing}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSyncing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSyncing ? 'Syncing...' : 'Sync Medical Data'} 
                  <i className={`fas fa-sync ${isSyncing ? 'fa-spin' : ''}`} style={{ marginLeft: '5px' }}></i>
                </button>
              </div>
            </>
          )}
        </div>

        {/* View Popup */}
        {showViewPopup && selectedPatient && (
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
                ) : selectedPatient.medicalHistory?.length > 0 ? (
                  <table className="medical-history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Doctor</th>
                        <th>Condition</th>
                        <th>Notes</th>
                        <th>Document</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPatient.medicalHistory.map((record, index) => (
                        <tr key={index}>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{record.doctorName || 'self'}</td>
                          <td>{record.condition}</td>
                          <td>{record.notes}</td>
                          <td>
                            {record?.fileInfo ? (
                              <button
                                className="action-btn view"
                                onClick={() => {
                                  setSelectedImage({ ...record.fileInfo, _id: record._id });
                                  setShowImageModal(true);
                                }}
                                title="View Document"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            ) : (
                              "No document"
                            )}
                          </td>
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

        {/* Access Request Popup */}
        {showAccessRequestPopup && selectedPatient && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className="popup-header">
                <h3>Request Access</h3>
                <button className="close-btn" onClick={() => setShowAccessRequestPopup(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="popup-body">
                <p>Requesting access to view medical history for:</p>
                <p><strong>{selectedPatient.name}</strong></p>
                <div className="popup-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => setShowAccessRequestPopup(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="submit-btn"
                    onClick={() => handlePermissionToggle(selectedPatient)}
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRequestSentPopup && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Request Already Sent</h3>
                <button className="close-btn" onClick={() => setShowRequestSentPopup(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p>A request for this patient is already pending.</p>
              </div>
            </div>
          </div>
        )}

        {showImageModal && selectedImage && (
          <div className="modal-overlay">
            <div className="modal-content image-modal">
              <div className="modal-header">
                <h3>Document: {selectedImage.originalName}</h3>
                <button className="close-btn" onClick={() => setShowImageModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                {selectedImage.mimeType && selectedImage.mimeType.startsWith('image/') ? (
                  <img 
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/medical-history/image/${selectedImage._id}`}
                    alt={selectedImage.originalName}
                    style={{ maxWidth: '100%', maxHeight: '80vh' }}
                  />
                ) : (
                  <a
                    href={`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'}/medical-history/image/${selectedImage._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-file-alt"></i> View {selectedImage.originalName}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsurancePatientList;