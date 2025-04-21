import React from 'react';
import '../patient/PatientDashboard.css';

const BookAppointmentForm = () => {
  return (
    <form className="booking-form">
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>Department</label>
          <select>
            <option value="">Select Department</option>
            <option value="cardiology">Cardiology</option>
            <option value="neurology">Neurology</option>
            <option value="orthopedics">Orthopedics</option>
            <option value="general">General Medicine</option>
          </select>
        </div>
        <div className="form-group col-md-6">
          <label>Doctor</label>
          <select>
            <option value="">Select Doctor</option>
            <option value="1">Dr. Sarah Johnson</option>
            <option value="2">Dr. Michael Chen</option>
            <option value="3">Dr. Emily Brown</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group col-md-6">
          <label>Preferred Date</label>
          <input type="date" />
        </div>
        <div className="form-group col-md-6">
          <label>Preferred Time</label>
          <select>
            <option value="">Select Time</option>
            <option value="09:00">09:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="14:00">02:00 PM</option>
            <option value="15:00">03:00 PM</option>
            <option value="16:00">04:00 PM</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Reason for Visit</label>
        <textarea placeholder="Briefly describe your symptoms or reason for visit"></textarea>
      </div>
      <button type="submit" className="book-appointment-btn">
        Book Appointment
      </button>
    </form>
  );
};

export default BookAppointmentForm; 