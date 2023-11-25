import React, { useState } from "react";
import axios from "axios";
import "./Register.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Register = () => {
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/users/register", {
        username,
        mobileNumber,
      });
      setMessage(response.data.message);
      if (response.status === 200) {
        // Show a success toast
        toast.success("Registration successful!");
        // Store the token and mobile number in localStorage
        localStorage.setItem("token", response.data.token);

        // Navigate to the '/verify-otp' page
        navigate("/verify-otp");
      }
    } catch (error) {
      setMessage("Error: " + error.response.data.message);
      // Show an error toast
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <h1 className="register-title">User Registration</h1>
      <form className="register-form" onSubmit={handleSubmit}>
        <label className="register-label">
          Username:
          <input
            type="text"
            value={username}
            placeholder="Enter your username"
            onChange={(e) => setUsername(e.target.value)}
            className="register-input"
          />
        </label>
        <label className="register-label">
          Mobile Number:
          <input
            type="text"
            value={mobileNumber}
            placeholder="Enter your mobile number"
            onChange={(e) => setMobileNumber(e.target.value)}
            className="register-input"
          />
        </label>
        <button type="submit" className="register-button">
          Register
        </button>
      </form>
      {message && <p className="register-message">{message}</p>}
      <ToastContainer />
    </div>
  );
};

export default Register;
