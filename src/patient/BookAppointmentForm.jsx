import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../patient/PatientDashboard.css';

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

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const token = userData.token;
  const userRole = userData.role;

  // Fetch doctors when department changes
  useEffect(() => {
    if (formData.department) {
      fetchDoctors();
    }
  }, [formData.department]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_URL}/appointment/doctors/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Doctors data:', data); // Debug log
      
      if (data.success) {
        if (userRole === 'admin') {
          setDoctors(data.data.doctors);
        } else {
          const filteredDoctors = data.data.doctors.filter(doctor => 
            doctor.specialization.toLowerCase() === formData.department.toLowerCase()
          );
          console.log('Filtered doctors:', filteredDoctors); // Debug log
          setDoctors(filteredDoctors);
        }
      }
    } catch (error) {
      console.log('Error fetching doctors:', error.message);
      setError('Error loading doctors. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/appointment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Appointment response:', data); // Debug log

      if (response.ok) {
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
        setError(data.message || 'Failed to book appointment');
      }
    } catch (error) {
      setError('Error booking appointment. Please try again.');
      console.log('Error:', error.message);
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
            disabled={!formData.department && localStorage.getItem('userRole') !== 'admin'}
          >
            <option value="">Select Doctor</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.fullName} - {doctor.specialization}
                {localStorage.getItem('userRole') === 'admin' && ` (${doctor.experience} years)`}
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
          />
        </div>
        <div className="form-group col-md-6">
          <label>Preferred Time</label>
          <select 
            name="appointmentTime"
            value={formData.appointmentTime}
            onChange={handleChange}
            required
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
        />
      </div>
      <button type="submit" className="book-appointment-btn">
        Book Appointment
      </button>
    </form>
  );
};

export default BookAppointmentForm; 