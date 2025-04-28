import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Making API call to:', `${API_URL}/patient/patientlogin`);
      console.log('Sending login data:', { email, password });

      const response = await fetch(`${API_URL}/patient/patientlogin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and token in localStorage
        const userData = {
          _id: data.user._id,
          email: data.user.email,
          role: data.user.role,
          token: data.token
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Redirect based on role
        if (data.user.role === 'patient') {
          navigate('/patient-dashboard');
        } else if (data.user.role === 'doctor') {
          navigate('/doctor-dashboard');
        } else if (data.user.role === 'admin') {
          navigate('/admin-dashboard');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.message === 'Network Error') {
        setError('Unable to connect to server. Please check if the server is running.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default Login; 