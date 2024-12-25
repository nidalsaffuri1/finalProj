const express = require("express");
const Project = require("../models/project");
const Customer = require("../models/customer");
const router = express.Router();

// Fetch all projects (with pagination, sorting, and search)
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      search = "",
    } = req.query;

    const sortOrder = order === "asc" ? 1 : -1;

    const query = {};
    if (search) {
      const customers = await Customer.find({
        name: { $regex: search, $options: "i" },
      });
      const customerIds = customers.map((customer) => customer._id);

      query.$or = [
        { serialNumber: { $regex: search, $options: "i" } },
        { truckModel: { $regex: search, $options: "i" } },
        { customerId: { $in: customerIds } },
      ];
    }

    const projects = await Project.find(query)
      .populate("customerId", "name email phone address")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalProjects = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(totalProjects / limit),
      totalProjects,
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Error fetching projects:", err.message);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Fetch a single project by ID (This is the missing route)
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching project by ID:", req.params.id); // Debugging log
    const project = await Project.findById(req.params.id).populate(
      "customerId",
      "name email phone address"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    console.log("Fetched Project Details:", project); // Debugging log

    res.json(project);
  } catch (err) {
    console.error("Error fetching project by ID:", err.message);
    res.status(500).json({ error: "Failed to fetch project by ID" });
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
      notes,
      dynamicFields = [],
    } = req.body;

    if (!serialNumber) {
      return res.status(400).json({ error: "Serial Number is required." });
    }

    let customer = await Customer.findOne({ name: customerName });
    if (!customer) {
      customer = new Customer({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
      });
      customer = await customer.save();
    }

    const project = new Project({
      serialNumber,
      truckModel,
      weight,
      phoneNumber,
      notes,
      customerId: customer._id,
      dynamicFields,
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (err) {
    console.error("Error creating project:", err.message);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Update a project
router.put("/:id", async (req, res) => {
  try {
    const {
      serialNumber,
      truckModel,
      weight,
      phoneNumber,
      notes,
      dynamicFields,
    } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { serialNumber, truckModel, weight, phoneNumber, notes, dynamicFields },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (err) {
    console.error("Error updating project:", err.message);
    res.status(500).json({ error: "Failed to update project" });
  }
});

module.exports = router;
