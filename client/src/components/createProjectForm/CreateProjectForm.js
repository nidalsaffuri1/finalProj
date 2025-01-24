import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { createProject, fetchCustomerById } from "../../services/api"; // Import the new function
import "./createProjectFormm.css";

const CreateProjectForm = () => {
  const navigate = useNavigate();
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

  const [message, setMessage] = useState("");

  // Get customerId from URL (when clicking ➕ button)
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const customerId = searchParams.get("customerId");

  // Fetch customer data if customerId exists
  useEffect(() => {
    const loadCustomerData = async () => {
      if (customerId) {
        try {
          const customer = await fetchCustomerById(customerId);
          console.log("Customer Data:", customer); // Debug: Check if data returns
          setFormData((prev) => ({
            ...prev,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            customerAddress: customer.address,
          }));
          console.log("Customer Data Loaded:", customer);
        } catch (error) {
          console.error("Failed to load customer data:", error);
        }
      }
    };
    loadCustomerData();
  }, [customerId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...formData,
        customerId: customerId || undefined, // Pass customerId if available
      };

      // Remove checklist if empty
      if (!projectData.checklist || projectData.checklist.length === 0) {
        delete projectData.checklist;
      }

      console.log("Submitting Project Data:", projectData);
      await createProject(projectData); // Call API to create the project

      setMessage("Project created successfully!");
      if (!customerId) {
        // Reset form only if it's a new customer
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
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setMessage("Failed to create project. Please try again.");
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const projectData = {
  //       ...formData,
  //       customerId: customerId || undefined, // Pass customerId if available
  //     };

  //     console.log("Submitting Project Data:", projectData);

  //     await createProject(projectData); // Call API to create the project

  //     setMessage("Project created successfully!");

  //     if (!customerId) {
  //       // Reset form only if it's a new customer
  //       setFormData({
  //         serialNumber: "",
  //         customerName: "",
  //         customerEmail: "",
  //         customerPhone: "",
  //         customerAddress: "",
  //         truckModel: "",
  //         truckRegistrationNumber: "",
  //         truckWeightCapacity: "",
  //         notes: "",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error creating project:", error);
  //     setMessage("Failed to create project. Please try again.");
  //   }
  // };

  return (
    <div className="container">
      <div className="project-details">
        <div className="navigation-button">
          <button onClick={() => navigate("/")}>Back to Projects</button>
        </div>
        {/* Rest of your component */}
      </div>
      <h1>
        {customerId
          ? "Add Project for Existing Customer"
          : "Create New Project"}
      </h1>
      <form onSubmit={handleSubmit} className="create-form">
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

        <label>
          Customer Name:
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            disabled={!!customerId} // Disable if prefilled
          />
        </label>

        <label>
          Customer Email:
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            disabled={!!customerId}
          />
        </label>

        <label>
          Customer Phone:
          <input
            type="text"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            disabled={!!customerId}
          />
        </label>

        <label>
          Customer Address:
          <input
            type="text"
            name="customerAddress"
            value={formData.customerAddress}
            onChange={handleChange}
            disabled={!!customerId}
          />
        </label>

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

        <label>
          Notes:
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </label>

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
