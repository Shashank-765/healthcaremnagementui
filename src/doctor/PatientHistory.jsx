import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientHistory.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';

const PatientHistory = () => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sample data - replace with your actual data
  const patientHistoryData = [
    {
      patientId: "P001",
      patientName: "John Doe",
      visitDate: "2024-02-20",
      visitTime: "10:00 AM",
      recoveryDate: "2024-02-27",
      department: "Cardiology"
    },
    {
      patientId: "P002",
      patientName: "Jane Smith",
      visitDate: "2024-02-19",
      visitTime: "11:30 AM",
      recoveryDate: "2024-02-26",
      department: "Neurology"
    },
    {
      patientId: "P003",
      patientName: "Mike Johnson",
      visitDate: "2024-02-18",
      visitTime: "2:15 PM",
      recoveryDate: "2024-02-25",
      department: "Orthopedics"
    },
    {
      patientId: "P004",
      patientName: "Sarah Williams",
      visitDate: "2024-02-17",
      visitTime: "9:45 AM",
      recoveryDate: "2024-02-24",
      department: "Pediatrics"
    },
    {
      patientId: "P005",
      patientName: "Robert Brown",
      visitDate: "2024-02-16",
      visitTime: "3:30 PM",
      recoveryDate: "2024-02-23",
      department: "Dermatology"
    },
    {
      patientId: "P006",
      patientName: "Emily Davis",
      visitDate: "2024-02-15",
      visitTime: "1:00 PM",
      recoveryDate: "2024-02-22",
      department: "ENT"
    }
  ];

  const displayedRecords = showAllRecords ? patientHistoryData : patientHistoryData.slice(0, 3);

  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    // Add your delete logic here
    setShowDeleteModal(false);
    setSelectedPatient(null);
  };

  const handleViewClick = (patient) => {
    setSelectedPatient(patient);
    setShowViewModal(true);
    setEditMode(false);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    // Add your save logic here
    setEditMode(false);
    setShowViewModal(false);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setShowViewModal(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
        <div className="patient-history-container">
          <div className="section-header">
            <h2>Patient History</h2>
            <div className="header-actions">
              <div className="search-boxs">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Search patient history..."/>
              </div>
            </div>
          </div>
          <div className="table-responsive">
            <table className="patient-history-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Department</th>
                  <th>Visit Date</th>
                  <th>Visit Time</th>
                  <th>Recovery Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{record.patientId}</td>
                    <td>{record.patientName}</td>
                    <td>{record.department}</td>
                    <td>{record.visitDate}</td>
                    <td>{record.visitTime}</td>
                    <td>{record.recoveryDate}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view"
                          onClick={() => handleViewClick(record)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteClick(record)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="view-more-container">
            <button 
              className="view-more-btn"
              onClick={() => setShowAllRecords(!showAllRecords)}
            >
              {showAllRecords ? (
                <>View Less <i className="fas fa-chevron-up"></i></>
              ) : (
                <>View More <i className="fas fa-chevron-down"></i></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* View/Edit Modal */}
      {showViewModal && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h3>{editMode ? 'Edit Patient Record' : 'Patient Details'}</h3>
              <button 
                className="close-btn"
                onClick={handleCancelEdit}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form className="patient-form">
                <div className="form-group">
                  <label>Patient ID</label>
                  <input 
                    type="text" 
                    value={selectedPatient?.patientId} 
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Patient Name</label>
                  <input 
                    type="text" 
                    value={selectedPatient?.patientName} 
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input 
                    type="text" 
                    value={selectedPatient?.department} 
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Visit Date</label>
                  <input 
                    type="date" 
                    value={selectedPatient?.visitDate} 
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Visit Time</label>
                  <input 
                    type="time" 
                    value={selectedPatient?.visitTime} 
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Recovery Date</label>
                  <input 
                    type="date" 
                    value={selectedPatient?.recoveryDate} 
                    disabled={!editMode}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              {!editMode ? (
                <>
                  <button 
                    className="edit-btn"
                    onClick={handleEditClick}
                  >
                    Edit
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancelEdit}
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="save-btn"
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button 
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this record?</p>
              <p><strong>Patient:</strong> {selectedPatient?.patientName}</p>
              <p><strong>Visit Date:</strong> {selectedPatient?.visitDate}</p>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="delete-btn"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory; 