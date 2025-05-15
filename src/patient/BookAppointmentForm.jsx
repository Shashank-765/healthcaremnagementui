import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../patient/PatientDashboard.css';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const BookAppointmentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    department: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch doctors when department changes
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!formData.department) return;

      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (!userData.token) {
          setError('Authentication required');
          navigate('/patient-dashboard', { replace: true });
          return;
        }

        const response = await axios.get(`${API_URL}/appointment/doctors/all`, {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Doctors API Response:', response.data);

        if (response.data.success) {
          const filteredDoctors = response.data.data.doctors.filter(doctor => {
            if (!doctor || !doctor.specialization) {
              console.warn('Doctor or specialization is missing:', doctor);
              return false;
            }
            return doctor.specialization.toLowerCase() === formData.department.toLowerCase();
          });

          console.log('Filtered doctors:', filteredDoctors);
          setDoctors(filteredDoctors);
          setError('');
        } else {
          setError(response.data.message || 'Failed to fetch doctors');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        if (error.response?.status === 401) {
          setError('Session expired. Please login again.');
          navigate('/patient-dashboard', { replace: true });
        } else {
          setError('Error loading doctors. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [formData.department, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear any previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.token) {
            setError('Please log in to book an appointment');
            return;
        }

        console.log('Sending appointment request:', {
            department: formData.department,
            doctorId: formData.doctorId,
            appointmentDate: formData.appointmentDate,
            appointmentTime: formData.appointmentTime,
            reason: formData.reason
        });

        const response = await axios.post(
            `${API_URL}/appointment/create`,
            {
                department: formData.department,
                doctorId: formData.doctorId,
                appointmentDate: formData.appointmentDate,
                appointmentTime: formData.appointmentTime,
                reason: formData.reason
            },
            {
                headers: {
                    'Authorization': `Bearer ${userData.token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Server response:', response.data);

        if (response.data.success) {
            setSuccess('Appointment booked successfully!');
            // Clear form
            setFormData({
                department: '',
                doctorId: '',
                appointmentDate: '',
                appointmentTime: '',
                reason: ''
            });
            // Redirect to appointments list after 2 seconds
            setTimeout(() => {
                navigate('/patient/all-appointments');
            }, 1000);
        } else {
            if (response.data.response?.status === 500) {
                setError('Server is busy or encountered an error. Please try again later.');
            } else {
                setError(response.data.message || 'Failed to book appointment');
            }
        }
    } catch (error) {
        console.log('Error booking appointment:', error.message);
        
        if (error.response) {
            // Server responded with error
            if (error.response.status === 500) {
                setError('Server is busy or encountered an error. Please try again later.');
            } else {
                setError(error.response.data.message || 'Failed to book appointment');
            }
        } else if (error.request) {
            setError('Server is not responding or is busy. Please try again later.');
        } else {
            setError('Error creating appointment. Please try again.');
        }
    }
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>Department</label>
          <select 
            name="department" 
            value={formData.department}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Department</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurologist">Neurologist</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="General Medicine">General Medicine</option>
          </select>
        </div>
        <div className="form-group col-md-6">
          <label>Doctor</label>
          <select 
            name="doctorId" 
            value={formData.doctorId}
            onChange={handleChange}
            required
            disabled={!formData.department || loading}
          >
            <option value="">Select Doctor</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.fullName} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>Preferred Date</label>
          <input 
            type="date" 
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group col-md-6">
          <label>Preferred Time</label>
          <select 
            name="appointmentTime"
            value={formData.appointmentTime}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="">Select Time</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="12:00 PM">12:00 PM</option>
            <option value="01:00 PM">01:00 PM</option>
            <option value="02:00 PM">02:00 PM</option>
            <option value="03:00 PM">03:00 PM</option>
            <option value="04:00 PM">04:00 PM</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Reason for Visit</label>
        <textarea 
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Briefly describe your symptoms or reason for visit"
          required
          disabled={loading}
        />
      </div>
      <button 
        type="submit" 
        className="book-appointment-btn"
        disabled={loading}
      >
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
};

export default BookAppointmentForm; 