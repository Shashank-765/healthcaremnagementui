import React from 'react';
import './PatientDashboard.css';

const MedicalHistoryItem = ({ record, handleEditClick }) => {
  return (
    <>
      <div className="history-date">{record.date}</div>
      <div className="history-details">
        <div className="history-header">
          <h3>{record.condition}</h3>
          <div className="action-buttons">
            <button 
              className="action-btn edit"
              onClick={() => handleEditClick(record)}
            >
              <i className="fas fa-edit"></i>
            </button>
          </div>
        </div>
        <p><strong>Doctor:</strong> {record.doctor}</p>
        <p><strong>Medications:</strong> {record.medications}</p>
        <p><strong>Follow-up:</strong> {record.followUp}</p>
        <p><strong>Notes:</strong> {record.notes}</p>
      </div>
    </>
  );
};

export default MedicalHistoryItem; 