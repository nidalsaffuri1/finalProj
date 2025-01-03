const express = require("express");
const Project = require("../models/project");
const Customer = require("../models/customer");
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error.message);
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// Create a new project
router.post("/", async (req, res) => {
  try {
    const {
      serialNumber,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      truckModel,
      weight,
      phoneNumber,
    } = req.body;

    // Create a new customer
    const newCustomer = new Customer({
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      address: customerAddress,
    });
    const savedCustomer = await newCustomer.save();

    // Create a new project
    const newProject = new Project({
      serialNumber,
      customerId: savedCustomer._id, // Link the customer to the project
      truckModel,
      weight,
      phoneNumber,
    });
    const savedProject = await newProject.save();

    res.status(201).json(savedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

module.exports = router;
