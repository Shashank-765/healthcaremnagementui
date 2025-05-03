import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './medicalHistory.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';
import { FaEye } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MedicalHistory = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.token) {
      navigate('/patient-dashboard');
      return;
    }
    fetchMedicalHistory();
  }, [navigate]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData?.token) {
        navigate('/patient-dashboard');
        return;
      }

      const response = await axios.get(`${API_URL}/medical-history/patient/history`, {
        headers: {
          Authorization: `Bearer ${userData.token}`
        }
      });

      if (response.data.success) {
        setMedicalHistory(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch medical history');
      }
    } catch (error) {
      console.error('Error fetching medical history:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/patient-dashboard');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch medical history');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleShowAll = () => {
    setShowAllHistory(!showAllHistory);
  };

  const displayedHistory = showAllHistory ? medicalHistory : medicalHistory.slice(0, 5);

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  const ViewModal = ({ record, onClose }) => {
    if (!record) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Medical Record Details</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="record-detail">
              <strong>Doctor Name:</strong> {record.doctorId?.fullName || 'N/A'}
            </div>
            <div className="record-detail">
              <strong>Condition:</strong> {record.condition || 'N/A'}
            </div>
            <div className="record-detail">
              <strong>Notes:</strong> {record.notes || 'N/A'}
            </div>
            <div className="record-detail">
              <strong>Date:</strong> {new Date(record.date).toLocaleDateString() || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      <div className="main-content">
        <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        {/* Banner Section */}
        <div className="admin-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="banner-content">
            <div className="doctor-profile">
              <img src={doctorImage} alt="Doctor Profile" />
            </div>
            <h1>YOUR HEALTH IS OUR PRIORITY</h1>
          </div>
        </div>
        <div className="medical-history-container">
          <div className="section-header">
            <h2>My Medical History</h2>
          </div>
          <div className="table-responsive">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Loading medical history data...</span>
                </div>
              </div>
            ) : error ? (
              <div className="error-container">
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              </div>
            ) : medicalHistory.length === 0 ? (
              <div className="no-records-container">
                <div className="no-records">
                  <i className="fas fa-folder-open"></i>
                  <span>No medical history records found</span>
                </div>
              </div>
            ) : (
              <>
                <table className="medical-history-table">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Condition</th>
                      <th>Notes</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedHistory.map((record, index) => (
                      <tr key={index}>
                        <td>{record.doctorId?.fullName || 'N/A'}</td>
                        <td>{record.condition || 'N/A'}</td>
                        <td>{record.notes || 'N/A'}</td>
                        <td>{new Date(record.date).toLocaleDateString() || 'N/A'}</td>
                        <td>
                          <button 
                            className="view-btn"
                            onClick={() => handleViewRecord(record)}
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {medicalHistory.length > 5 && (
                  <button 
                    className="view-more-btn"
                    onClick={toggleShowAll}
                  >
                    {showAllHistory ? 'Show Less' : 'View More'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {showModal && <ViewModal record={selectedRecord} onClose={closeModal} />}
    </div>
  );
};

export default MedicalHistory; 