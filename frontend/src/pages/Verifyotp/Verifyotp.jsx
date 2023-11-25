import React, { useState } from 'react';
import "./Verifyotp.css";
const VerifyOTP = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOTP] = useState('');
  const [message, setMessage] = useState('');
  const handleVerifyOTP = async () => {
    try {
      const response = await fetch('/api/users/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobileNumber, otp }),
      });
      if (response.status === 200) {
        const data = await response.json();
        setMessage(data.message);
        // Store the JWT token in local storage
        localStorage.setItem('token', data.token);
        // Navigate to the '/home' page
        
      } else {
        const data = await response.json();
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
      setMessage('Internal Server Error');
    }
  };
  return (
    <div className="verify-otp-container">
      <h2>OTP Verification</h2>
      <div>
        <label htmlFor="mobileNumber">Mobile Number:</label>
        <input
          type="text"
          id="mobileNumber"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="otp">OTP:</label>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => setOTP(e.target.value)}
          required
        />
      </div>
      <button onClick={handleVerifyOTP}>Verify OTP</button>
      <p>{message}</p>
    </div>
  );
};
export default VerifyOTP;
