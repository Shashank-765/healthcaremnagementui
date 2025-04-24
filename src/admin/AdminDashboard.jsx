import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import './DoctorsList.css';
import { LineChart, Line, AreaChart, Area, XAxis, PieChart, Pie, Cell } from 'recharts';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import logoImage from '../image/logo.png';
import Navbar from '../component/Navbar';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:5000/api/v1';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Pagination state
  const [itemsPerPage] = useState(3);
  const [confirmedPage, setConfirmedPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [confirmedAppointments, setConfirmedAppointments] = useState([
    {
      id: 1,
      doctor: {
        name: "Dr. Sarah Johnson",
        specialization: "Cardiologist"
      },
      patient: {
        name: "John Doe",
        time: "Today, 10:00 AM",
        contact: "+1234567890"
      }
    }
  ]);
  const [pendingAppointments, setPendingAppointments] = useState([
    {
      id: 1,
      doctor: {
        name: "Dr. Emily Brown",
        specialization: "Pediatrician"
      },
      patient: {
        name: "David Smith",
        time: "Tomorrow, 09:00 AM",
        contact: "+1234567892"
      }
    }
  ]);
  const [adminStats, setAdminStats] = useState({
    totalBeds: 0,
    totalHospitals: 0,
    staffInformation: 0,
    otherStaff: 0,
    totalStaff: 0,
    totalPatients: 0,
    totalDoctors: 0,
    newDoctors: 0,
    newPatients: 0,
    totalAppointments: 0,
  });

  // Mock data for doctors
  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialization: "Cardiologist",
      experience: "10 years",
      availability: "Mon-Fri",
      contact: "+1234567890",
      email: "sarah.j@hospital.com",
      image: "https://example.com/doctor1.jpg"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: "Neurologist",
      experience: "15 years",
      availability: "Tue-Sat",
      contact: "+1234567891",
      email: "michael.c@hospital.com",
      image: "https://example.com/doctor2.jpg"
    },
    {
      id: 3,
      name: "Dr. Emily Brown",
      specialization: "Pediatrician",
      experience: "8 years",
      availability: "Mon-Sat",
      contact: "+1234567892",
      email: "emily.b@hospital.com",
      image: "https://example.com/doctor3.jpg"
    },
    {
      id: 4,
      name: "Dr. drake Brown",
      specialization: "Pediatrician",
      experience: "8 years",
      availability: "Mon-Sat",
      contact: "+1234567892",
      email: "emily.b@hospital.com",
      image: "https://example.com/doctor3.jpg"
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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
    }
  ];

  const handleMenuClick = (item) => {
    if (item.submenu) {
      setExpandedItem(expandedItem === item.id ? null : item.id);
    } else {
      navigate(item.path);
    }
  };

  // Mock data for charts
  const reportData = [
    { name: 'Sa', doctors: 5, patients: 15 },
    { name: 'Su', doctors: 10, patients: 5 },
    { name: 'Mo', doctors: 5, patients: 10 },
    { name: 'Tu', doctors: 20, patients: 8 },
    { name: 'We', doctors: 8, patients: 15 },
    { name: 'Th', doctors: 15, patients: 5 },
    { name: 'Fr', doctors: 5, patients: 10 }
  ];

  const balanceData = [
    { name: '1', income: 10, outcome: 8 },
    { name: '2', income: 15, outcome: 13 },
    { name: '3', income: 12, outcome: 10 },
    { name: '4', income: 18, outcome: 16 },
    { name: '5', income: 15, outcome: 12 },
    { name: '6', income: 22, outcome: 18 },
    { name: '7', income: 20, outcome: 15 }
  ];
  const COLORS = ['#00C49F', '#0088FE', '#FFBB28'];

  // Dashboard data
  const handleLogout = () => {
    navigate('/admin/login');
  };

  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSpecializationChange = (e) => {
    setSelectedSpecialization(e.target.value);
  };

  // Filter doctors based on search query and specialization
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = selectedSpecialization === '' || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  // Calculate current items for confirmed appointments
  const indexOfLastConfirmed = confirmedPage * itemsPerPage;
  const indexOfFirstConfirmed = indexOfLastConfirmed - itemsPerPage;
  const currentConfirmed = confirmedAppointments.slice(indexOfFirstConfirmed, indexOfLastConfirmed);

  // Calculate current items for pending appointments
  const indexOfLastPending = pendingPage * itemsPerPage;
  const indexOfFirstPending = indexOfLastPending - itemsPerPage;
  const currentPending = pendingAppointments.slice(indexOfFirstPending, indexOfLastPending);

  const handleConfirmedPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(confirmedAppointments.length / itemsPerPage)) {
      setConfirmedPage(newPage);
    }
  };

  const handlePendingPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(pendingAppointments.length / itemsPerPage)) {
      setPendingPage(newPage);
    }
  };

  const handleAcceptAppointment = (appointmentId) => {
    // Find the appointment in pending appointments
    const appointment = pendingAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      // Add to confirmed appointments
      setConfirmedAppointments(prev => [...prev, appointment]);
      // Remove from pending appointments
      setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
    }
  };

  const handleRejectAppointment = (appointmentId) => {
    // Remove from pending appointments
    setPendingAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };

  const fetchAdminData = async () => {
    try {
        const token = Cookies.get('token');
        if (!token) {
            navigate('/admin/login');
            return;
        }

        const response = await axios.get(`${API_URL}/admin/admin-data`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data) {
            const { 
                totalBeds, 
                totalHospitals, 
                staffInformation, 
                totalPatients, 
                totalDoctors,
                newDoctors,
                newPatients,
                totalAppointments,
            } = response.data.data;
            
            const totalStaff = staffInformation ? 
                Object.values(staffInformation).reduce((sum, count) => sum + (count || 0), 0) : 0;
            
            setAdminStats({
                totalBeds,
                totalHospitals,
                staffInformation: totalStaff,
                otherStaff: totalStaff - (totalBeds + totalHospitals),
                totalStaff: totalStaff,
                totalPatients: totalPatients || 0,
                totalDoctors: totalDoctors || 0,
                newDoctors: newDoctors || 0,
                newPatients: newPatients || 0,
                totalAppointments: totalAppointments || 0,
            });
        }
    } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load admin data');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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
        <div className="stats-grid-admin">
          {/* Doctor Card */}
          <div className="stat-card">
            <div className="stat-icon doctor">
              <i className="fas fa-user-md"></i>
            </div>
            <div className="stat-info">
              <h4>Total Hospital</h4>
              <div className="stat-number">{adminStats.totalHospitals}</div>
            </div>
          </div>

          {/* Patient Card */}
          <div className="stat-card">
            <div className="stat-icon patient">
              <i className="fas fa-wheelchair"></i>
            </div>
            <div className="stat-info">
              <h4>Total Beds</h4>
              <div className="stat-number">{adminStats.totalBeds}</div>
            </div>
          </div>

          {/* Total Hospital Card */}
          <div className="stat-card">
            <div className="stat-icon hospital">
              <i className="fas fa-hospital"></i>
            </div>
            <div className="stat-info">
              <h4>Other Staff</h4>
              <div className="stat-number">{adminStats.otherStaff}</div>
            </div>
          </div>
          
          {/* Report Card */}
          <div className="stat-card">
            <h4>Report</h4>
            <div className="chart-info">
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="dot doctors"></span>
                  <span>Doctors</span>
                </div>
                <div className="legend-item">
                  <span className="dot patients"></span>
                  <span>Patients</span>
                </div>
              </div>
              <div className="chart-container">
                <LineChart 
                  width={230} 
                  height={100} 
                  data={reportData} 
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <Line 
                    type="monotone" 
                    dataKey="doctors" 
                    stroke="#4CAF50" 
                    strokeWidth={2} 
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="patients" 
                    stroke="#2196F3" 
                    strokeWidth={2} 
                    dot={false}
                  />
                  <XAxis dataKey="name" hide />
                </LineChart>
              </div>
            </div>
          </div>
        </div>

        {/* Small Info Cards */}
        <div className="small-cards-grid">
          <div className="small-card">
            <div className="small-card-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="small-card-info">
              <h5>Total Staff</h5>
              <p>{adminStats.totalStaff || 0}</p>
            </div>
          </div>

          <div className="small-card">
            <div className="small-card-icon">
              <i className="fas fa-user-md"></i>
            </div>
            <div className="small-card-info">
              <h5>Total Doctors</h5>
              <p>{adminStats.totalDoctors || 0}</p>
            </div>
          </div>

          <div className="small-card">
            <div className="small-card-icon">
              <i className="fas fa-wheelchair"></i>
            </div>
            <div className="small-card-info">
              <h5>Total Patients</h5>
              <p>{adminStats.totalPatients || 0}</p>
            </div>
          </div>

          <div className="small-card">
            <div className="small-card-icon">
              <i className="fas fa-procedures"></i>
            </div>
            <div className="small-card-info">
              <h5>Total Appointments</h5>
              <p>{adminStats.totalAppointments || 0}</p>
            </div>
          </div>

          <div className="small-card">
            <div className="small-card-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <div className="small-card-info">
              <h5>New Patients</h5>
              <p>{adminStats.newPatients || 0}</p>
            </div>
          </div>

          <div className="small-card">
            <div className="small-card-icon">
              <i className="fas fa-user-md"></i>
            </div>
            <div className="small-card-info">
              <h5>New Doctors</h5>
              <p>{adminStats.newDoctors || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="appointment-admindashboard">
          <div className="row">
            {/* Confirmed Appointments Column */}
            <div className="col-md-6">
              <div className="appointment-section">
                <div className="appointment-header">
                  <h3><i className="fas fa-check-circle"></i> Confirmed Appointments</h3>
                </div>
                <div className="appointment-cards">
                  {currentConfirmed.map(appointment => (
                    <div key={appointment.id} className="appointment-card confirmed">
                      <div className="appointment-info">
                        <div className="doctor-brief">
                          <i className="fas fa-user-md"></i>
                          <div className="doctor-details">
                            <h4>{appointment.doctor.name}</h4>
                            <p>{appointment.doctor.specialization}</p>
                          </div>
                        </div>
                        <div className="appointment-details">
                          <p><i className="fas fa-user"></i> {appointment.patient.name}</p>
                          <p><i className="fas fa-calendar"></i> {appointment.patient.time}</p>
                          <p><i className="fas fa-phone"></i> {appointment.patient.contact}</p>
                        </div>
                        <div className="appointment-status">
                          <span className="status-badge confirmed">Confirmed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="view-more-link">
                    <button onClick={() => navigate('/admin/confirmed-appointments')} className="view-more-btn">
                      View More <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Appointments Column */}
            <div className="col-md-6">
              <div className="appointment-section">
                <div className="appointment-header">
                  <h3><i className="fas fa-clock"></i> Pending Appointments</h3>
                </div>
                <div className="appointment-cards">
                  {currentPending.map(appointment => (
                    <div key={appointment.id} className="appointment-card pending">
                      <div className="appointment-info">
                        <div className="doctor-brief">
                          <i className="fas fa-user-md"></i>
                          <div className="doctor-details">
                            <h4>{appointment.doctor.name}</h4>
                            <p>{appointment.doctor.specialization}</p>
                          </div>
                        </div>
                        <div className="appointment-details">
                          <p><i className="fas fa-user"></i> {appointment.patient.name}</p>
                          <p><i className="fas fa-calendar"></i> {appointment.patient.time}</p>
                          <p><i className="fas fa-phone"></i> {appointment.patient.contact}</p>
                        </div>
                        <div className="appointment-status">
                          <span className="status-badge pending">Pending</span>
                          <div className="action-buttons">
                            <button className="accept-btn" onClick={() => handleAcceptAppointment(appointment.id)}>
                              <i className="fas fa-check"></i>
                            </button>
                            <button className="reject-btn" onClick={() => handleRejectAppointment(appointment.id)}>
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="view-more-link">
                    <button onClick={() => navigate('/admin/pending-appointments')} className="view-more-btn">
                      View More <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="header-section-admindashboard">
          <div className="header-section">
            <div className="header-content2">
              <h2>Hospital Doctors</h2>
              <div className="header-content-right">
              <div className="search-bar1">
                <i className="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  placeholder="Search doctors by name..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              </div>
            </div>
          </div>
          
          <div className="doctors-grid">
            {filteredDoctors.map(doctor => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-image">
                  <i className="fas fa-user-md"></i>
                </div>
                <div className="doctor-info">
                  <h3>{doctor.name}</h3>
                  <p className="specialization">{doctor.specialization}</p>
                  <p className="experience"><i className="fas fa-clock"></i> {doctor.experience}</p>
                  <p className="availability"><i className="fas fa-calendar"></i> {doctor.availability}</p>
                  <p className="contact"><i className="fas fa-phone"></i> {doctor.contact}</p>
                  <p className="email"><i className="fas fa-envelope"></i> {doctor.email}</p>
                </div>
                <div className="doctor-actions">
                  <button className="view-profile" onClick={() => handleViewProfile(doctor)}>View Profile</button>
                </div>
              </div>
            ))}
          </div>

          {/* Profile Modal */}
          {showModal && selectedDoctor && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Doctor Profile</h2>
                  <button className="close-button" onClick={closeModal}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="profile-header">
                    <div className="profile-image">
                      <i className="fas fa-user-md"></i>
                    </div>
                    <div className="profile-title">
                      <h3>{selectedDoctor.name}</h3>
                      <p>{selectedDoctor.specialization}</p>
                    </div>
                  </div>
                  
                  <div className="profile-details">
                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-clock"></i>
                        Experience
                      </div>
                      <div className="detail-value">{selectedDoctor.experience}</div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-calendar"></i>
                        Availability
                      </div>
                      <div className="detail-value">{selectedDoctor.availability}</div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-phone"></i>
                        Contact
                      </div>
                      <div className="detail-value">{selectedDoctor.contact}</div>
                    </div>
                    
                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-envelope"></i>
                        Email
                      </div>
                      <div className="detail-value">{selectedDoctor.email}</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-star"></i>
                        Rating
                      </div>
                      <div className="detail-value">4.8/5</div>
                    </div>

                    <div className="detail-item">
                      <div className="detail-label">
                        <i className="fas fa-users"></i>
                        Patients
                      </div>
                      <div className="detail-value">1.2k+</div>
                    </div>
                  </div>

                  <div className="profile-bio">
                    <h4>About</h4>
                    <p>
                      Dr. {selectedDoctor.name.split(' ')[1]} is a highly skilled {selectedDoctor.specialization.toLowerCase()} 
                      with {selectedDoctor.experience} of experience. They have successfully treated thousands of patients 
                      and are known for their patient-centric approach to healthcare.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
  );
};

export default AdminDashboard; 