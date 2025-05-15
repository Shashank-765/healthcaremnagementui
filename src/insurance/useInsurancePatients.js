import { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

export default function useInsurancePatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [stats, setStats] = useState({
        totalPatients: 0,
        insuredPatients: 0,
        totalMedicalHistory: 0
    });

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const token = Cookies.get('token');
            const response = await axios.get(`${API_URL}/insurance/patients-with-medical-history`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                setPatients(response.data.data);
                // Calculate stats
                const totalPatients = response.data.data.length;
                const insuredPatients = response.data.data.filter(patient => patient.isVerified).length;
                setStats({
                    totalPatients,
                    insuredPatients,
                    totalMedicalHistory: response.data.totalMedicalHistory || 0
                });
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    // Function to manually trigger syncing medical data
    // This should be used sparingly, like once a day or by admin request
    const syncMedicalData = async () => {
        try {
            setIsSyncing(true);
            const token = Cookies.get('token');
            await axios.post(
                `${API_URL}/insurance/sync-medical-history`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            // Refresh data after sync
            await fetchPatients();
        } catch (error) {
            console.error('Error syncing medical data:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleAccessRequest = async (patient) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.post(
                `${API_URL}/insurance/request-access`,
                {
                    patientName: patient.name
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success) {
                alert('Access request sent successfully');
                fetchPatients(); // Refresh data after request
                return response.data;
            }
        } catch (error) {
            console.error('Error sending access request:', error);
            throw error; // Rethrow to allow caller to handle specific errors
        }
    };

    const handleVerificationToggle = async (patient) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(
                `${API_URL}/insurance/verify-patient/${encodeURIComponent(patient.name)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success) {
                fetchPatients(); // Refresh data after verification
            }
        } catch (error) {
            console.error('Error updating verification:', error);
        }
    };

    const handleViewPatient = async (patient) => {
        try {
            const token = Cookies.get('token');
            const response = await axios.get(
                `${API_URL}/insurance/patient-medical-history/${encodeURIComponent(patient.name)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            if (response.data.success) {
                return {
                    ...patient,
                    medicalHistory: response.data.data
                };
            }
        } catch (error) {
            console.error('Error fetching medical history:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchPatients();
        // We're not calling syncMedicalData() here to avoid the performance issue
        // It should be called manually or on a schedule
    }, []);

    return {
        patients,
        loading,
        isSyncing,
        stats,
        handleAccessRequest,
        handleVerificationToggle,
        handleViewPatient,
        refreshPatients: fetchPatients,
        syncMedicalData
    };
} 