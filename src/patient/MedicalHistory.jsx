import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './PatientDashboard.css';
import './medicalHistory.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import EditHistoryForm from './EditHistoryForm';
import MedicalHistoryItem from './MedicalHistoryItem';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';

const MedicalHistory = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [medicalHistory, setMedicalHistory] = useState([
    { 
      id: 1,
      date: "2023-12-15", 
      condition: "Hypertension", 
      doctor: "Dr. Sarah Johnson", 
      notes: "Prescribed medication and lifestyle changes",
      medications: "Lisinopril 10mg",
      followUp: "2024-03-15"
    },
    { 
      id: 2,
      date: "2023-11-20", 
      condition: "Annual Checkup", 
      doctor: "Dr. Michael Chen", 
      notes: "All vitals normal",
      medications: "None",
      followUp: "2024-11-20"
    },
    { 
      id: 3,
      date: "2023-09-10", 
      condition: "Flu Symptoms", 
      doctor: "Dr. Emily Brown", 
      notes: "Prescribed rest and fluids",
      medications: "Acetaminophen",
      followUp: "2023-09-17"
    },
    { 
      id: 4,
      date: "2023-07-05", 
      condition: "Allergy Consultation", 
      doctor: "Dr. Robert Wilson", 
      notes: "Allergy testing completed",
      medications: "Antihistamines",
      followUp: "2023-08-05"
    }
  ]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleViewMoreClick = () => {
    setShowAllHistory(!showAllHistory);
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleEditClick = (record) => {
    setEditingHistoryId(record.id);
    setEditFormData(record);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setMedicalHistory(prev => 
      prev.map(record => 
        record.id === editingHistoryId ? editFormData : record
      )
    );
    setEditingHistoryId(null);
    setEditFormData({});
  };

  const handleEditCancel = () => {
    setEditingHistoryId(null);
    setEditFormData({});
  };

  const displayedHistory = showAllHistory 
    ? medicalHistory 
    : medicalHistory.slice(0, 2);

  return (
    <div className="dashboard-container">
      <button className="mobile-toggle" onClick={toggleSidebar}>
        <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
      </button>

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <div className={`main-content ${isSidebarOpen ? 'content-shifted' : ''}`}>
        <Navbar 
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        <div className="admin-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="banner-content">
            <div className="doctor-profile">
              <img src={doctorImage} alt="Doctor" />
            </div>
            <h1>YOUR HEALTH IS<br />OUR PRIORITY</h1>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="card-header">
            <h3>
              <i className="fas fa-notes-medical"></i>
              Medical History
            </h3>
          </div>
          <div className="card-content">
            <div className="medical-history-grid">
              {displayedHistory.map((record) => (
                <div key={record.id} className="history-item">
                  {editingHistoryId === record.id ? (
                    <EditHistoryForm
                      editFormData={editFormData}
                      handleEditChange={handleEditChange}
                      handleEditSubmit={handleEditSubmit}
                      handleEditCancel={handleEditCancel}
                    />
                  ) : (
                    <MedicalHistoryItem
                      record={record}
                      handleEditClick={handleEditClick}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="view-more-container">
              <div className="view-more-link" onClick={handleViewMoreClick}>
                {showAllHistory ? 'Show Less' : 'View More History'}
                <i className={`fas fa-arrow-${showAllHistory ? 'up' : 'right'}`}></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory; 