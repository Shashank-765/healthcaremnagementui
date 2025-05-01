import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './medicalHistory.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const MedicalHistory = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchMedicalHistory();
  }, [navigate]);

  const fetchMedicalHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.get(`${API_URL}/medical-history/patient/history`, {
        headers: {
          Authorization: `Bearer ${token}`
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
        navigate('/');
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
              <div className="loading">Loading...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : medicalHistory.length === 0 ? (
              <div className="no-records">No medical history records found</div>
            ) : (
              <>
                <table className="medical-history-table">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Condition</th>
                      <th>Notes</th>
                      <th>Date</th>
                      <th>Medications</th>
                      <th>Follow-up Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedHistory.map((record, index) => (
                      <tr key={index}>
                        <td>{record.doctorId?.fullName || 'N/A'}</td>
                        <td>{record.condition || 'N/A'}</td>
                        <td>{record.notes || 'N/A'}</td>
                        <td>{new Date(record.date).toLocaleDateString() || 'N/A'}</td>
                        <td>{record.medications || 'N/A'}</td>
                        <td>{record.followUpDate ? new Date(record.followUpDate).toLocaleDateString() : 'N/A'}</td>
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
    </div>
  );
};

export default MedicalHistory; 