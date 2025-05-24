import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../admin/AdminDashboard.css';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import Cookies from 'js-cookie';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Add custom styles
const styles = {
  verificationStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  verifiedIcon: {
    color: '#28a745',
    fontSize: '1.2rem',
    transition: 'all 0.3s ease',
  },
  unverifiedIcon: {
    color: '#dc3545',
    fontSize: '1.2rem',
    transition: 'all 0.3s ease',
  },
  imageModal: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto'
  }
};

const HistoryList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [accessRequests, setAccessRequests] = useState({});
  const [verifiedPatients, setVerifiedPatients] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const token = userData?.token;
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchPatients(token);
    fetchAccessRequests(token);
  }, [navigate]);

  const fetchPatients = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/patients`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPatients(response.data.data);
      const verifiedMap = {};
      response.data.data.forEach(patient => {
        verifiedMap[patient._id] = patient.isVerified;
      });
      setVerifiedPatients(verifiedMap);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessRequests = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/admin/insurance-access-requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const requestsMap = {};
        const permissionsMap = {};
        response.data.data.forEach(request => {
          requestsMap[request.patientDetails._id] = request.requestId;
          permissionsMap[request.patientDetails._id] = request.status === 'approved';
        });
        setAccessRequests(requestsMap);
        setPermissions(permissionsMap);
      }
    } catch (error) {
      console.error('Error fetching access requests:', error);
      if (error.response?.status === 401) {
        Cookies.remove('adminToken');
        navigate('/admin/login');
      }
    }
  };

  const fetchMedicalHistory = async (patientName) => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const token = userData?.token;
      if (!token) {
        navigate('/admin/login');
        return;
      }
      const response = await axios.get(`${API_URL}/admin/patient-medical-history/${encodeURIComponent(patientName)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setMedicalHistory(response.data.data.medicalHistory);
      } else {
        console.error('Error fetching medical history:', response.data.message);
        setMedicalHistory([]);
      }
    } catch (error) {
      console.error('Error fetching medical history:', error);
      if (error.response?.status === 401) {
        Cookies.remove('adminToken');
        navigate('/admin/login');
      }
      setMedicalHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = async (patient) => {
    setSelectedPatient(patient);
    await fetchMedicalHistory(patient.name);
    setShowModal(true);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    Cookies.remove('adminToken');
    navigate('/admin/login');
  };

  const handlePermissionToggle = async (patient) => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      const token = userData?.token;
      if (!token) {
        navigate('/admin/login');
        return;
      }

      // Toggle verification status
      const newVerifiedStatus = !verifiedPatients[patient._id];
      setVerifiedPatients(prev => ({
        ...prev,
        [patient._id]: newVerifiedStatus
      }));

      // If there's no existing request, create one first
      if (!accessRequests[patient._id]) {
        const createResponse = await axios.post(
          `${API_URL}/insurance/request-access`,
          { patientName: patient.name },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (createResponse.data.success) {
          const newRequestId = createResponse.data.data.requestId;
          setAccessRequests(prev => ({
            ...prev,
            [patient._id]: newRequestId
          }));

          console.log('Sending to handle-insurance-request:', {
            requestId: newRequestId,
            action: permissions[patient._id] ? 'deny' : 'approve'
          });
          const response = await axios.post(
            `${API_URL}/admin/handle-insurance-request`,
            {
              requestId: newRequestId,
              action: permissions[patient._id] ? 'deny' : 'approve'
            },
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );

          if (response.data.success) {
            setPermissions(prev => ({
              ...prev,
              [patient._id]: !prev[patient._id]
            }));
            await fetchAccessRequests(token);
          }
          setLoading(false);
          return; // Exit so you don't call the API again below
        }
      }

      // If requestId already exists, proceed as before
      console.log('Sending to handle-insurance-request:', {
        requestId: accessRequests[patient._id],
        action: permissions[patient._id] ? 'deny' : 'approve'
      });
      const response = await axios.post(
        `${API_URL}/admin/handle-insurance-request`,
        {
          requestId: accessRequests[patient._id],
          action: permissions[patient._id] ? 'deny' : 'approve'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setPermissions(prev => ({
          ...prev,
          [patient._id]: !prev[patient._id]
        }));
        await fetchAccessRequests(token);
      }
    } catch (error) {
      console.error('Error toggling permission:', error);
      if (error.response?.status === 401) {
        Cookies.remove('adminToken');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewImage = (fileInfo) => {
    if (fileInfo) {
      console.log(fileInfo);  
      setSelectedImage(fileInfo);
      setShowImageModal(true);
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: 'fas fa-th-large',
      label: 'Dashboard',
      path: '/admin/admin-dashboard'
    },
    {
      id: 'doctors',
      icon: 'fas fa-user-md',
      label: 'Doctors',
      path: '/admin/doctors',
      submenu: [
        { label: 'All Doctors', path: '/admin/doctors' },
        { label: 'Add Doctor', path: '/admin/add-doctor' }
      ]
    },
    {
      id: 'patients',
      icon: 'fas fa-user-injured',
      label: 'Patients',
      path: '/admin/patients',
      submenu: [
        { label: 'All Patients', path: '/admin/patients' },
        { label: 'Add Patient', path: '/admin/add-patient' }
      ]
    },
    {
      id: 'appointments',
      icon: 'fas fa-calendar-check',
      label: 'Appointments',
      path: '/admin/appointments',
      submenu: [
        { label: 'Confirmed Appointments', path: '/admin/confirmed-appointments' },
        { label: 'Pending Appointments', path: '/admin/pending-appointments' }
      ]
    },
    {
      id: 'patient history',
      icon: 'fas fa-user-injured',
      label: 'patient history',
      path: '/admin/history-list'
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
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
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
        {/* Navbar */}
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

        {/* Patient List Table */}
        <div className="appointments-table-container">
          <h4>Patient History List</h4>
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
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
                {patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.name}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.email}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn view"
                          title="View Medical History"
                          onClick={() => handleViewPatient(patient)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className={`action-btn permission ${permissions[patient._id] ? 'active' : ''}`}
                          title={permissions[patient._id] ? 'Revoke Insurance Access' : 'Grant Insurance Access'}
                          onClick={() => handlePermissionToggle(patient)}
                          disabled={loading}
                        >
                          <i className={`fas fa-${permissions[patient._id] ? 'user-check' : 'user-plus'}`}></i>
                        </button>
                        <div 
                          className="verification-status" 
                          style={styles.verificationStatus}
                          onClick={() => handlePermissionToggle(patient)}
                        >
                          {verifiedPatients[patient._id] ? (
                            <i className="fas fa-check-circle" style={styles.verifiedIcon}></i>
                          ) : (
                            <i className="fas fa-times-circle" style={styles.unverifiedIcon}></i>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Medical History Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{selectedPatient?.name}'s Medical History</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                {loading ? (
                  <div className="loading-spinner">Loading...</div>
                ) : medicalHistory.length > 0 ? (
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
                      {medicalHistory.map((record, index) => (
                        <tr key={index}>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td>{record.doctorName}</td>
                          <td>{record.condition}</td>
                          <td>{record.notes}</td>
                          <td>
                            {record?.fileInfo ? (
                              <button
                                className="action-btn view"
                                onClick={() => handleViewImage({ ...record.fileInfo, _id: record._id })}
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

        {/* Image View Modal */}
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
                    src={`${API_URL}/medical-history/image/${selectedImage._id}`}
                    alt={selectedImage.originalName}
                    style={{ maxWidth: '100%', maxHeight: '80vh' }}
                  />
                ) : (
                  <a
                    href={`${API_URL}/medical-history/image/${selectedImage._id}`}
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

export default HistoryList;