import React, { useState } from "react";
import axios from "axios";
import "./Addcontact.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddContact = ({ onContactAdded }) => {
  const [userMobileNumber, setUserMobileNumber] = useState("");
  const [contactMobileNumber, setContactMobileNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      // Get the token from local storage
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not available. Please log in.");
        return;
      }
      const headers = {
        Authorization: token,
      };
      const response = await axios.post(
        "/api/users/add-contact",
        {
          userMobileNumber,
          contactMobileNumber,
        },
        { headers }
      );
      if (response.status === 200) {
        setMessage(response.data.message);
        // Show a success toast notification
        toast.success("Contact added successfully!");
        // Call the onContactAdded function with the newly added contact's mobile number
        onContactAdded(contactMobileNumber);
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data && error.response.data.message) {
        setMessage("Error: " + error.response.data.message);
      } else {
        setMessage("An error occurred while adding the contact.");
      }
      toast.error("Failed to add contact. Please try again.");
    }
  };

  return (
    <div className="add-contact-container">
      <h2>Add Contact</h2>
      <form className="add-contact-form" onSubmit={handleAddContact}>
        <div className="form-group">
          <label htmlFor="userMobileNumber">Your Mobile Number:</label>
          <input
            type="text"
            id="userMobileNumber"
            value={userMobileNumber}
            onChange={(e) => setUserMobileNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contactMobileNumber">Contact's Mobile Number:</label>
          <input
            type="text"
            id="contactMobileNumber"
            value={contactMobileNumber}
            onChange={(e) => setContactMobileNumber(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Contact</button>
      </form>
      {message && <p className="add-contact-message">{message}</p>}
      <ToastContainer />
    </div>
  );
};

export default AddContact;
