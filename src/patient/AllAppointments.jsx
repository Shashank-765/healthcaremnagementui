import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../patient/Allappointments.css';
import Sidebar from '../component/Sidebar';
import Navbar from '../component/Navbar';
import bannerImage from '../image/banner.png';
import doctorImage from '../image/girl.png';

const AllAppointments = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Initial dummy data for appointments
  const initialAppointments = [
    { id: 1, doctor: "Dr. Sarah Johnson", department: "Cardiology", date: "2024-02-25", time: "10:00 AM", status: "Confirmed" },
    { id: 2, doctor: "Dr. Michael Chen", department: "Neurology", date: "2024-03-01", time: "2:30 PM", status: "Pending" },
    { id: 3, doctor: "Dr. Emily Brown", department: "Orthopedics", date: "2024-03-05", time: "11:15 AM", status: "Confirmed" }
  ];

  // Additional dummy data for expanded view
  const additionalAppointments = [
    { id: 4, doctor: "Dr. Robert Wilson", department: "Cardiology", date: "2024-03-10", time: "09:00 AM", status: "Confirmed" },
    { id: 5, doctor: "Dr. Lisa Anderson", department: "Neurology", date: "2024-03-15", time: "03:30 PM", status: "Confirmed" }
  ];

  const allAppointments = showAllAppointments 
    ? [...initialAppointments, ...additionalAppointments]
    : initialAppointments;

  // Filter appointments based on search query
  const filteredAppointments = allAppointments.filter(appointment =>
    appointment.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = () => {
    navigate('/');
  };

  const handleViewAllClick = () => {
    setShowAllAppointments(!showAllAppointments);
  };

  const handleView = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setEditFormData(appointment);
    setShowEditModal(true);
  };

  const handleDelete = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // Handle edit submission here
    console.log('Edited appointment:', editFormData);
    setShowEditModal(false);
  };

  const handleDeleteConfirm = () => {
    // Handle delete confirmation here
    console.log('Deleted appointment:', selectedAppointment);
    setShowDeleteModal(false);
  };

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

  return (
    <div className="dashboard-container-patient">
      <button className="mobile-toggle" onClick={toggleSidebar}>
        <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
      </button>

      <Sidebar 
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        isSubmenuOpen={true}
      />
      
      <div className={`main-content2 ${isSidebarOpen ? 'content-shifted' : ''}`}>
        <Navbar 
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        {/* Banner */}
        <div className="patient-banner" style={{ backgroundImage: `url(${bannerImage})` }}>
          <div className="banner-content">
            <div className="doctor-profile">
              <img src={doctorImage} alt="Doctor" />
            </div>
            <h1>YOUR HEALTH IS<br />OUR PRIORITY</h1>
          </div>
        </div>
        {/* Appointments Card */}
        <div className="dashboard-card2">
          <div className="card-header">
            <h3>
              <i className="fas fa-calendar-check"></i>
              All Appointments
            </h3>
            <div className="search-container">
              <div className="search-box2">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by doctor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="card-content">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(appointment => (
                  <tr key={appointment.id}>
                    <td>{appointment.doctor}</td>
                    <td>{appointment.department}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>
                      <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="action-btn view"
                        onClick={() => handleView(appointment)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEdit(appointment)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDelete(appointment)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="view-more-container">
              <div className="view-more-link" onClick={handleViewAllClick}>
                {showAllAppointments ? 'Show Less' : 'View All Appointments'}
                <i className={`fas fa-arrow-${showAllAppointments ? 'up' : 'right'}`}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Appointment Details</h3>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="appointment-details">
                <p><strong>Doctor:</strong> {selectedAppointment.doctor}</p>
                <p><strong>Department:</strong> {selectedAppointment.department}</p>
                <p><strong>Date:</strong> {selectedAppointment.date}</p>
                <p><strong>Time:</strong> {selectedAppointment.time}</p>
                <p><strong>Status:</strong> 
                  <span className={`status-badge ${selectedAppointment.status.toLowerCase()}`}>
                    {selectedAppointment.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Appointment</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-group">
                  <label>Doctor</label>
                  <select 
                    value={editFormData.doctor}
                    onChange={(e) => setEditFormData({...editFormData, doctor: e.target.value})}
                  >
                    <option value="Dr. Sarah Johnson">Dr. Sarah Johnson</option>
                    <option value="Dr. Michael Chen">Dr. Michael Chen</option>
                    <option value="Dr. Emily Brown">Dr. Emily Brown</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select 
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Orthopedics">Orthopedics</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <select 
                    value={editFormData.time}
                    onChange={(e) => setEditFormData({...editFormData, time: e.target.value})}
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="save-btn">Save Changes</button>
                  <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="modal-header">
              <h3>Delete Appointment</h3>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this appointment?</p>
              <div className="appointment-summary">
                <p><strong>Doctor:</strong> {selectedAppointment.doctor}</p>
                <p><strong>Date:</strong> {selectedAppointment.date}</p>
                <p><strong>Time:</strong> {selectedAppointment.time}</p>
              </div>
              <div className="modal-footer">
                <button className="delete-btn" onClick={handleDeleteConfirm}>Yes, Delete</button>
                <button className="cancel-btn" onClick={() => setShowDeleteModal(false)}>No, Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAppointments; 