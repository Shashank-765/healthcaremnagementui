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
          const filteredDoctors = response.data.data.doctors.filter(doctor => 
            doctor.specialization.toLowerCase() === formData.department.toLowerCase()
          );
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
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      // if (!userData.token || !userData._id || !userData.email) {
      //   setError('Authentication required. Please try again.');
      //   setLoading(false);
      //   return;
      // }

      const appointmentData = {
        ...formData,
        patientEmail: userData.email,
        patientId: userData._id
      };

      const response = await axios.post(
        `${API_URL}/appointment/create`,
        appointmentData,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Appointment Response:', response.data);

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
          navigate('/all-appointments');
        }, 1000);
      } else {
        setError(response.data.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please try again.');
      } else {
        setError(error.response?.data?.message || 'Error booking appointment. Please try again.');
      }
    } finally {
      setLoading(false);
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