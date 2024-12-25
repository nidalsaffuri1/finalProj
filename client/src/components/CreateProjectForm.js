import React, { useState } from "react";
import { createProject } from "../services/api"; // Import API function

const CreateProjectForm = () => {
  // State to hold form inputs
  const [formData, setFormData] = useState({
    serialNumber: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    truckModel: "",
    truckRegistrationNumber: "",
    truckWeightCapacity: "",
    notes: "",
  });

  const [message, setMessage] = useState(""); // For success/error messages

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting Form Data:", formData); // Log form data before submission
      const response = await createProject(formData); // Call the API
      console.log("Response from API:", response); // Log API response
      setMessage("Project created successfully!");
      // Reset the form after successful submission
      setFormData({
        serialNumber: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        truckModel: "",
        truckRegistrationNumber: "",
        truckWeightCapacity: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating project:", error);
      setMessage("Failed to create project. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1>Create New Project</h1>
      <form onSubmit={handleSubmit} className="create-form">
        {/* Project Details */}
        <label>
          Serial Number:
          <input
            type="text"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleChange}
            required
          />
        </label>

        {/* Customer Details */}
        <label>
          Customer Name:
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Customer Email:
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
          />
        </label>
        <label>
          Customer Phone:
          <input
            type="text"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
          />
        </label>
        <label>
          Customer Address:
          <input
            type="text"
            name="customerAddress"
            value={formData.customerAddress}
            onChange={handleChange}
          />
        </label>

        {/* Truck Details */}
        <label>
          Truck Model:
          <input
            type="text"
            name="truckModel"
            value={formData.truckModel}
            onChange={handleChange}
          />
        </label>
        <label>
          Truck Registration Number:
          <input
            type="text"
            name="truckRegistrationNumber"
            value={formData.truckRegistrationNumber}
            onChange={handleChange}
          />
        </label>
        <label>
          Truck Weight Capacity:
          <input
            type="number"
            name="truckWeightCapacity"
            value={formData.truckWeightCapacity}
            onChange={handleChange}
          />
        </label>

        {/* Notes */}
        <label>
          Notes:
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </label>

        {/* Submit Button */}
        <button type="submit">Submit</button>
      </form>
      {message && (
        <p className={`message ${message.includes("Failed") ? "error" : ""}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default CreateProjectForm;
