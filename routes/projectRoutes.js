const express = require("express");
const Project = require("../models/project");
const Truck = require("../models/truck");
const Customer = require("../models/customer");
const Product = require("../models/product");
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

// Fetch a single project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("customerId", "name email phone address")
      .populate("checklist.productId", "name unitPrice"); // Ensure proper population

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error("Error fetching project by ID:", err.message);
    res.status(500).json({ error: "Failed to fetch project by ID" });
  }
});

// Create a new project (Prevent Duplicate Checklist)
router.post("/", async (req, res) => {
  try {
    const {
      serialNumber,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      truckModel,
      truckRegistrationNumber,
      truckWeightCapacity,
      notes,
      dynamicFields = [],
    } = req.body;

    if (!serialNumber) {
      return res.status(400).json({ error: "Serial Number is required." });
    }

    // Step 1: Find or create the customer
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

    // Step 2: Find or create the truck
    let truck = await Truck.findOne({
      registrationNumber: truckRegistrationNumber,
    });
    if (!truck) {
      truck = new Truck({
        model: truckModel,
        registrationNumber: truckRegistrationNumber,
        weightCapacity: truckWeightCapacity,
        owner: customer._id,
      });
      truck = await truck.save();
    }

    // Step 3: Fetch existing products ONCE
    const products = await Product.find();

    // Step 4: Map products to checklist format (ONLY ADD if not already present)
    const checklist = products.map((product) => ({
      productId: product._id,
      productName: product.name,
      price: product.unitPrice,
      checked: false,
    }));

    // Step 5: Create the project with the checklist
    const project = new Project({
      serialNumber,
      customerId: customer._id,
      truckId: truck._id,
      notes,
      dynamicFields,
      checklist, // Add checklist ONCE
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
    const { checklist, ...updateData } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        ...updateData,
        checklist,
      },
      { new: true }
    )
      .populate("checklist.productId", "name unitPrice")
      .populate("customerId", "name email phone address"); // <-- Re-populate customer

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (err) {
    console.error("Error updating project:", err.message);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.put("/:id/notes", async (req, res) => {
  try {
    const { notes } = req.body;

    if (!notes) {
      return res.status(400).json({ error: "Notes cannot be empty." });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { notes },
      { new: true }
    ).populate("customerId", "name email phone address");

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (err) {
    console.error("Error updating notes:", err.message);
    res.status(500).json({ error: "Failed to update notes" });
  }
});

module.exports = router;
