import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TotalAppointments.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';

const TotalAppointments = () => {
  const navigate = useNavigate();
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sample appointments data
  const appointmentsData = [
    {
      id: "A001",
      patientName: "John Doe",
      date: "2024-02-20",
      time: "10:00 AM",
      department: "Cardiology",
      status: "Confirmed"
    },
    {
      id: "A002",
      patientName: "Jane Smith",
      date: "2024-02-21",
      time: "11:30 AM",
      department: "Neurology",
      status: "Pending"
    },
    {
      id: "A003",
      patientName: "Mike Johnson",
      date: "2024-02-22",
      time: "2:15 PM",
      department: "Orthopedics",
      status: "Confirmed"
    },
    {
      id: "A004",
      patientName: "Sarah Williams",
      date: "2024-02-23",
      time: "9:45 AM",
      department: "Pediatrics",
      status: "Confirmed"
    },
    {
      id: "A005",
      patientName: "Robert Brown",
      date: "2024-02-24",
      time: "3:30 PM",
      department: "Dermatology",
      status: "Pending"
    },
    {
      id: "A006",
      patientName: "Emily Davis",
      date: "2024-02-25",
      time: "1:00 PM",
      department: "ENT",
      status: "Confirmed"
    }
  ];

  const displayedAppointments = showAllAppointments ? appointmentsData : appointmentsData.slice(0, 3);

  const handleDeleteClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    // Add delete logic here
    setShowDeleteModal(false);
    setSelectedAppointment(null);
  };

  const handleViewClick = (appointment) => {
    setSelectedAppointment(appointment);
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
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} isSubmenuOpen={true}/>
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
        <div className="total-appointments-container">
          <div className="section-header">
            <h2>Total Appointments</h2>
            <div className="header-actions">
              <div className="search-boxs">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Search appointments..."/>
              </div>
            </div>
          </div>
          <div className="table-responsive">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient Name</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedAppointments.map((appointment, index) => (
                  <tr key={index}>
                    <td>{appointment.id}</td>
                    <td>{appointment.patientName}</td>
                    <td>{appointment.department}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view"
                          onClick={() => handleViewClick(appointment)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDeleteClick(appointment)}
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
              onClick={() => setShowAllAppointments(!showAllAppointments)}
            >
              {showAllAppointments ? (
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
              <h3>{editMode ? 'Edit Appointment' : 'Appointment Details'}</h3>
              <button 
                className="close-btn"
                onClick={handleCancelEdit}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form className="appointment-form">
                <div className="form-group">
                  <label>Appointment ID</label>
                  <input 
                    type="text" 
                    value={selectedAppointment?.id} 
                    disabled={true}
                  />
                </div>
                <div className="form-group">
                  <label>Patient Name</label>
                  <input 
                    type="text" 
                    value={selectedAppointment?.patientName} 
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input 
                    type="text" 
                    value={selectedAppointment?.department} 
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={selectedAppointment?.date} 
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input 
                    type="time" 
                    value={selectedAppointment?.time} 
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={selectedAppointment?.status} 
                    disabled={!editMode}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
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
              <p>Are you sure you want to delete this appointment?</p>
              <p><strong>Patient:</strong> {selectedAppointment?.patientName}</p>
              <p><strong>Date:</strong> {selectedAppointment?.date}</p>
              <p><strong>Time:</strong> {selectedAppointment?.time}</p>
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

export default TotalAppointments; 