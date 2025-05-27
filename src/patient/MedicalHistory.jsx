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
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [newHistory, setNewHistory] = useState({
    fullName: '',
    // doctorId: '',
    condition: '',
    date: '',
    notes: '',
    files: []
  });
  const [ratingDoctorEmail, setRatingDoctorEmail] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.token) {
      navigate('/patient-dashboard');
      return;
    }

    if (userData?.role === 'patient') {
      console.log('Setting patient info:', userData);
      setNewHistory(prev => ({
        ...prev,
        email: userData.email,
        fullName: userData.email.split('@')[0]
      }));
    } else {
      navigate('/patient-dashboard');
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
        const historyData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
        console.log('File Info in Response:', historyData.map(record => ({
          id: record._id,
          fileInfo: record.fileInfo,
          ipfsData: record.ipfsData
        })));
        setMedicalHistory(historyData);
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
    console.log("Record data:", record, "ccc");
    setSelectedRecord(record);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  const ViewModal = ({ record, onClose }) => {
    console.log('Full Record in ViewModal:', record);
    console.log('IPFS Data in ViewModal:', record?.ipfsData);
    console.log('File Info in ViewModal:', record?.fileInfo);
    console.log('Raw Record:', JSON.stringify(record, null, 2));

    if (!record) return null;

    // Helper function to get file information
    const getFileInfo = () => {
        // If fileInfo is an array
        if (Array.isArray(record.fileInfo)) {
            return record.fileInfo;
        }
        // If fileInfo is a single object
        else if (record.fileInfo && typeof record.fileInfo === 'object') {
            return [record.fileInfo];
        }
        // If fileInfo is in ipfsData
        else if (record.ipfsData?.file) {
            return [{
                originalName: record.ipfsData.file.originalName,
                mimeType: record.ipfsData.file.mimeType,
                size: record.ipfsData.file.size
            }];
        }
        return [];
    };

    const files = getFileInfo();

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Medical Record Details</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="record-detail">
                        <strong>Doctor Name:</strong> {record.doctorId?.fullName || record.doctorName || 'Self'}
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
                    <div className="record-detail">
                        <strong>Attached File:</strong>
                        {files.length > 0 ? (
                            <ul className="file-list">
                                {files.map((file, index) => (
                                    <li key={index}>
                                        {file.mimeType && file.mimeType.startsWith('image/') ? (
                                            <img
                                                src={`${API_URL}/medical-history/image/${record._id}`}
                                                alt={file.originalName}
                                                style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain', display: 'block', marginBottom: '8px' }}
                                            />
                                        ) : (
                                            <a
                                                href={`${API_URL}/medical-history/image/${record._id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i className="fas fa-file-alt"></i> {file.originalName}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            'No files attached'
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  useEffect(() => {
    console.log('Medical History State:', medicalHistory);
  }, [medicalHistory]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
        setNewHistory(prev => ({
            ...prev,
            files: selectedFiles
        }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    try {
        const formData = new FormData();
        
        // Append all fields to FormData
        formData.append('email', userData.email);
        formData.append('fullName', userData.email.split('@')[0]);
        formData.append('doctorName', 'Self');
        formData.append('condition', newHistory.condition.trim());
        formData.append('notes', newHistory.notes.trim());
        formData.append('date', newHistory.date || new Date().toISOString());
        
        // Change 'files' to 'file' to match multer configuration
        newHistory.files.forEach((file) => {
            formData.append('file', file); // Changed from 'files' to 'file'
        });

        const response = await axios.post(
            `${API_URL}/medical-history/self-history`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${userData.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        console.log('Server response:', response.data);
        
        if (response.data.success) {
            setMedicalHistory(prevHistory => [...prevHistory, response.data.data]);
            setShowCreatePopup(false);
            setNewHistory({ 
                fullName: '', 
                condition: '', 
                date: '', 
                notes: '', 
                files: [] 
            });
            alert('Medical history created successfully!');
        }
    } catch (err) {
        console.error('Error creating medical history:', err);
        if (err.response) {
            console.error('Error response data:', err.response.data);
            console.error('Error response status:', err.response.status);
            console.error('Error response headers:', err.response.headers);
        }
        alert(err.response?.data?.message || 'Failed to create medical history');
    }
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
          <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2>My Medical History</h2>
            <button
              className="create-history-btn"
              style={{
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginLeft: '16px'
              }}
              onClick={() => setShowCreatePopup(true)}
            >
              + Create Medical History
            </button>
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
                    {displayedHistory.map((record, index) => {
                      console.log('Record in table row:', record);
                      return (
                        <tr key={record._id || index}>
                          <td>{record.doctorId?.fullName || record.doctorName || 'Self'}</td>
                          <td>{record.condition || 'N/A'}</td>
                          <td>{record.notes || 'N/A'}</td>
                          <td>{new Date(record.date).toLocaleDateString() || 'N/A'}</td>
                          <td>
                            <button 
                              className="view-btn"
                              onClick={() => {
                                console.log('Full Record before view:', record);
                                console.log('File Info before view:', record.fileInfo);
                                console.log('IPFS Data before view:', record.ipfsData);
                                handleViewRecord(record);
                              }}
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
      {showCreatePopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Medical History</h2>
              <button className="close-btn" onClick={() => setShowCreatePopup(false)}>&times;</button>
            </div>
            <form
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label>Full Name:</label>
                <input
                  type="text"
                  value={newHistory.fullName}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Condition:</label>
                <input
                  type="text"
                  value={newHistory.condition}
                  onChange={e => setNewHistory({ ...newHistory, condition: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={newHistory.date}
                  onChange={e => setNewHistory({ ...newHistory, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes:</label>
                <input
                  type="text"
                  value={newHistory.notes}
                  onChange={e => setNewHistory({ ...newHistory, notes: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>File Upload:</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  multiple
                />
                <small className="file-info">
                  Supported formats: Images, PDF, Word documents (Max size: 5MB per file, Max 5 files)
                </small>
                {newHistory.files.length > 0 && (
                    <div className="selected-files">
                        <p>Selected files:</p>
                        <ul>
                            {newHistory.files.map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                    </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="submit" className="save-btn" style={{ background: '#4CAF50', color: 'white' }}>Save</button>
                <button type="button" className="cancel-btn" onClick={() => setShowCreatePopup(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory; 