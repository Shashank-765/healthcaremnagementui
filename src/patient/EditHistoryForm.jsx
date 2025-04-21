import React from 'react';
import './PatientDashboard.css';

const EditHistoryForm = ({ editFormData, handleEditChange, handleEditSubmit, handleEditCancel }) => {
  return (
    <form onSubmit={handleEditSubmit} className="edit-history-form">
      {/* Date and Condition Row */}
      <div className="edit-form-row">
        <div className="edit-form-col">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={editFormData.date}
            onChange={handleEditChange}
          />
        </div>
        <div className="edit-form-col">
          <label>Condition</label>
          <input
            type="text"
            name="condition"
            value={editFormData.condition}
            onChange={handleEditChange}
          />
        </div>
      </div>

      {/* Doctor and Medications Row */}
      <div className="edit-form-row">
        <div className="edit-form-col">
          <label>Doctor</label>
          <input
            type="text"
            name="doctor"
            value={editFormData.doctor}
            onChange={handleEditChange}
          />
        </div>
        <div className="edit-form-col">
          <label>Medications</label>
          <input
            type="text"
            name="medications"
            value={editFormData.medications}
            onChange={handleEditChange}
          />
        </div>
      </div>

      {/* Follow-up Date Row */}
      <div className="edit-form-row">
        <div className="edit-form-col">
          <label>Follow-up Date</label>
          <input
            type="date"
            name="followUp"
            value={editFormData.followUp}
            onChange={handleEditChange}
          />
        </div>
      </div>

      {/* Notes Row - Full Width */}
      <div className="edit-form-row">
        <div className="edit-form-col full-width">
          <label>Notes</label>
          <textarea
            name="notes"
            value={editFormData.notes}
            onChange={handleEditChange}
          ></textarea>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="edit-actions">
        <button type="submit" className="save-btn">
          <i className="fas fa-save"></i> Save Changes
        </button>
        <button type="button" onClick={handleEditCancel} className="cancel-btn">
          <i className="fas fa-times"></i> Cancel
        </button>
      </div>
    </form>
  );
};

export default EditHistoryForm; 