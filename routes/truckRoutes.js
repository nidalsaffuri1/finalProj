const express = require("express");
const Truck = require("../models/truck");
const Customer = require("../models/customer");
const router = express.Router();

// Create a new truck
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      truckModel,
      truckRegistrationNumber,
      truckWeightCapacity,
      ...projectData
    } = req.body;

    // Step 1: Create or find the customer
    let customer = await Customer.findOne({ name: customerName });
    if (!customer) {
      customer = new customer({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
      });
      customer = await customer.save();
    }

    // Step 2: Create or find the truck
    let truck = await Truck.findOne({
      registrationNumber: truckRegistrationNumber,
    });
    if (!truck) {
      truck = new Truck({
        model: truckModel,
        registrationNumber: truckRegistrationNumber,
        weightCapacity: truckWeightCapacity,
        owner: customer._id, // Link the truck to the customer
      });
      truck = await truck.save();
    }

    // Step 3: Create the project
    const project = new project({
      ...projectData,
      customerId: customer._id, // Link the project to the customer
      truckId: truck._id, // Link the project to the truck
    });
    const savedProject = await project.save();

    res.status(201).json(savedProject);
  } catch (err) {
    console.error("Error creating project:", err.message);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Get all trucks
router.get("/", async (req, res) => {
  try {
    const trucks = await Truck.find().populate("owner", "name");
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a truck by ID
router.get("/:id", async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id).populate("owner", "name");
    if (!truck) return res.status(404).json({ error: "Truck not found" });
    res.json(truck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a truck
router.put("/:id", async (req, res) => {
  try {
    const updatedTruck = await Truck.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedTruck)
      return res.status(404).json({ error: "Truck not found" });
    res.json(updatedTruck);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a truck
router.delete("/:id", async (req, res) => {
  try {
    const truck = await Truck.findByIdAndDelete(req.params.id);
    if (!truck) return res.status(404).json({ error: "Truck not found" });
    res.json({ message: "Truck deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
