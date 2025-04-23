import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorsList.css';
import logoImage from '../image/logo.png';
import doctorImage from '../image/girl.png';
import bannerImage from '../image/banner.png';
import Navbar from '../component/Navbar';

const DoctorsList = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState('doctors');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    reason: ''
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-close sidebar on mobile
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSpecializationChange = (e) => {
    setSelectedSpecialization(e.target.value);
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

  const handleLogout = () => {
    navigate('/');
  };

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
      name: "Dr. dmily Brown",
      specialization: "Pediatrician",
      experience: "3 years",
      availability: "Mon-Sat",
      contact: "+1234567892",
      email: "dmily.b@hospital.com",
      image: "https://example.com/doctor3.jpg"
    }
  ];

  const handleViewProfile = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleSchedule = (doctor) => {
    setSelectedDoctor(doctor);
    setShowScheduleModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDoctor(null);
  };

  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setSelectedDoctor(null);
    setScheduleForm({
      date: '',
      time: '',
      name: '',
      email: '',
      phone: '',
      reason: ''
    });
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Schedule Form Submitted:', {
      doctor: selectedDoctor,
      appointment: scheduleForm
    });
    closeScheduleModal();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScheduleForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleView = (doctor) => {
    setSelectedDoctor(doctor);
    setShowViewPopup(true);
  };

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setShowEditPopup(true);
  };

  const handleDelete = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeletePopup(true);
  };

  const handleAddDoctor = () => {
    navigate('/admin/add-doctor');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically update the doctor data in your backend
    console.log('Updated Doctor Data:', selectedDoctor);
    setShowEditPopup(false);
    // Redirect back to doctors list
    navigate('/admin/doctors');
  };

  const handleDeleteConfirm = () => {
    // Here you would typically delete the doctor from your backend
    console.log('Deleting Doctor:', selectedDoctor);
    setShowDeletePopup(false);
  };

  // Filter doctors based on search query and specialization
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialization = selectedSpecialization === '' || doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  return (
    <div className="doctors-list-container">
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
      <div className={`doctors-main-content ${isSidebarOpen ? '' : 'expanded'}`}>
        {/* Navbar with toggle */}
        <div className="navbar">
          <div className="navbar-left">
            <div 
              className="mobile-toggle" 
              onClick={toggleSidebar}
              style={{ display: windowWidth <= 1250 ? 'flex' : 'none' }}
            >
              <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
            </div>
            <div className="navbar-logo">
              <img src={logoImage} alt="Hospital Logo" className="nav-logo" />
            </div>
          </div>
          <div className="navbar-right">
            <div className="user-menu" onClick={handleUserClick}>
              <i className="fas fa-user-circle user-icon"></i>
              {showUserDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-item">
                    <i className="fas fa-user"></i>
                    Profile
                  </div>
                  <div className="dropdown-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                  </div>
                </div>
              )}
            </div>
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
<div className="doctor-listss">
        <div className="doctors-header">
          <div className="header-content">
            <div className="header-left">
              <h2>Hospital Doctors</h2>
            </div>
            <div className="header-right">
              <div className="department-select">
                <select value={selectedSpecialization} onChange={handleSpecializationChange}>
                  <option value="">All Specializations</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Gynecologist">Gynecologist</option>
                </select>
              </div>
              <div className="search-bar">
                <input 
                  type="text" 
                  placeholder="Search doctors..." 
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="doctors-table">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Availability</th>
                <th>Contact Number</th>
                <th>Email</th>
                <th>Qualification</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map(doctor => (
                <tr key={doctor.id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.experience}</td>
                  <td>{doctor.availability}</td>
                  <td>{doctor.contact}</td>
                  <td>{doctor.email}</td>
                  <td>{doctor.qualification || 'MBBS, MD'}</td>
                  <td>{doctor.address || 'Not Specified'}</td>
                  <td className="action-buttons">
                    <button className="view-btn" onClick={() => handleView(doctor)}>
                      <i className="fas fa-eye"></i>
                    </button>
                    <button className="edit-btn" onClick={() => handleEdit(doctor)}>
                      <i className="fas fa-edit"></i>
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(doctor)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* View Modal */}
        {showViewPopup && selectedDoctor && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className="popup-header">
                <h3>Doctor Details</h3>
                <button className="close-btn" onClick={() => setShowViewPopup(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="popup-body">
                <div className="doctor-profile-view">
                  <div className="profile-image">
                    {selectedDoctor.profileImage ? (
                      <img src={selectedDoctor.profileImage} alt={selectedDoctor.name} />
                    ) : (
                      <i className="fas fa-user-md"></i>
                    )}
                  </div>
                  <div className="doctor-details">
                    <p><strong>Full Name:</strong> {selectedDoctor.name}</p>
                    <p><strong>Specialization:</strong> {selectedDoctor.specialization}</p>
                    <p><strong>Experience:</strong> {selectedDoctor.experience}</p>
                    <p><strong>Availability:</strong> {selectedDoctor.availability}</p>
                    <p><strong>Contact Number:</strong> {selectedDoctor.contact}</p>
                    <p><strong>Email:</strong> {selectedDoctor.email}</p>
                    <p><strong>Qualification:</strong> {selectedDoctor.qualification || 'MBBS, MD'}</p>
                    <p><strong>Address:</strong> {selectedDoctor.address || 'Not Specified'}</p>
                    <p><strong>Bio:</strong> {selectedDoctor.bio || 'No bio available'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditPopup && selectedDoctor && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className="popup-header">
                <h3>Edit Doctor</h3>
                <button className="close-btn" onClick={() => setShowEditPopup(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="popup-body">
                <form onSubmit={handleEditSubmit} className="edit-doctor-form">
                  <div className="form-group">
                    <label>Full Name:</label>
                    <input
                      type="text"
                      value={selectedDoctor.name}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Specialization:</label>
                    <select
                      value={selectedDoctor.specialization}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, specialization: e.target.value})}
                      required
                    >
                      <option value="">Select Specialization</option>
                      <option value="Cardiologist">Cardiologist</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Pediatrician">Pediatrician</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Orthopedic">Orthopedic</option>
                      <option value="Gynecologist">Gynecologist</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Experience:</label>
                    <input
                      type="text"
                      value={selectedDoctor.experience}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, experience: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Availability:</label>
                    <input
                      type="text"
                      value={selectedDoctor.availability}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, availability: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number:</label>
                    <input
                      type="tel"
                      value={selectedDoctor.contact}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, contact: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={selectedDoctor.email}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Qualification:</label>
                    <input
                      type="text"
                      value={selectedDoctor.qualification || ''}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, qualification: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Address:</label>
                    <textarea
                      value={selectedDoctor.address || ''}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, address: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio:</label>
                    <textarea
                      value={selectedDoctor.bio || ''}
                      onChange={(e) => setSelectedDoctor({...selectedDoctor, bio: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Profile Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setSelectedDoctor({...selectedDoctor, profileImage: reader.result});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <div className="popup-footer">
                    <button type="submit" className="save-btn">Save Changes</button>
                    <button type="button" className="cancel-btn" onClick={() => setShowEditPopup(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeletePopup && selectedDoctor && (
          <div className="popup-overlay">
            <div className="popup-content">
              <div className="popup-header">
                <h3>Confirm Delete</h3>
                <button className="close-btn" onClick={() => setShowDeletePopup(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="popup-body">
                <p>Are you sure you want to delete Dr. {selectedDoctor.name}?</p>
                <div className="popup-footer">
                  <button className="delete-confirm-btn" onClick={handleDeleteConfirm}>Delete</button>
                  <button className="cancel-btn" onClick={() => setShowDeletePopup(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsList; 