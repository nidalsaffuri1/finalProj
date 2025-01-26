const express = require("express");
const Project = require("../models/project");
const authenticateToken = require("../middleware/authenticateToken");
const Truck = require("../models/truck");
const Customer = require("../models/customer");
const Product = require("../models/product");
const Task = require("../models/task");
const router = express.Router();

// Fetch all projects (with pagination, sorting, and search)
// router.get("/", authenticateToken, async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       sortBy = "createdAt",
//       order = "desc",
//       search = "",
//     } = req.query;

//     const sortOrder = order === "asc" ? 1 : -1;

//     // Get the companyId from the authenticated user's token
//     const companyId = req.user.companyId;

//     // Query to filter projects by companyId and optional search criteria
//     const query = { companyId };
//     if (search) {
//       const customers = await Customer.find({
//         name: { $regex: search, $options: "i" },
//       });
//       const customerIds = customers.map((customer) => customer._id);

//       query.$or = [
//         { serialNumber: { $regex: search, $options: "i" } },
//         { customerId: { $in: customerIds } },
//       ];
//     }

//     const projects = await Project.find(query)
//       .populate("customerId", "name email phone address")
//       .populate("truckId", "model")
//       .sort({ [sortBy]: sortOrder })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     const totalProjects = await Project.countDocuments(query);

//     res.json({
//       projects,
//       totalPages: Math.ceil(totalProjects / limit),
//       totalProjects,
//       currentPage: parseInt(page),
//     });
//   } catch (err) {
//     console.error("Error fetching projects:", err.message);
//     res.status(500).json({ error: "Failed to fetch projects" });
//   }
// });

router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      search = "",
    } = req.query;

    const sortOrder = order === "asc" ? 1 : -1;

    // Get companyId from the authenticated user's token
    const companyId = req.user.companyId;

    // Query to filter projects by companyId and optional search criteria
    const query = { companyId };
    if (search) {
      const customers = await Customer.find({
        name: { $regex: search, $options: "i" },
      });
      const customerIds = customers.map((customer) => customer._id);

      query.$or = [
        { serialNumber: { $regex: search, $options: "i" } },
        { customerId: { $in: customerIds } },
      ];
    }

    // Fetch projects with tasks and populate necessary fields
    const projects = await Project.find(query)
      .populate("customerId", "name email phone address")
      .populate("truckId", "model")
      .populate("dailyTasks.taskId", "name") // Get task names
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean(); // Use lean to enhance performance

    // Add `hasIncompleteTasks` property for each project
    const enrichedProjects = projects.map((project) => {
      const hasIncompleteTasks = project.dailyTasks.some(
        (task) => !task.isCompleted
      );
      return { ...project, hasIncompleteTasks };
    });

    const totalProjects = await Project.countDocuments(query);

    res.json({
      projects: enrichedProjects,
      totalPages: Math.ceil(totalProjects / limit),
      totalProjects,
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Error fetching projects:", err.message);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const project = await Project.findOne({
      _id: req.params.id,
      companyId,
    })
      .populate("customerId", "name email phone address")
      .populate("checklist.productId", "name unitPrice");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error("Error fetching project by ID:", err.message);
    res.status(500).json({ error: "Failed to fetch project by ID" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      serialNumber,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      truckModel,
      truckRegistrationNumber,
      truckWeightCapacity,
      notes,
      dynamicFields = [],
      checklist = [], // Optional field
    } = req.body;

    if (!serialNumber) {
      return res.status(400).json({ error: "Serial Number is required." });
    }

    // Handle customer creation or lookup
    let customer;
    if (customerId) {
      if (!ObjectId.isValid(customerId)) {
        return res.status(400).json({ error: "Invalid customerId format." });
      }
      customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found." });
      }
    } else {
      if (!customerName) {
        return res.status(400).json({ error: "Customer name is required." });
      }
      customer = await Customer.findOne({ name: customerName });
      if (!customer) {
        customer = new Customer({
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress,
        });
        customer = await customer.save();
      }
    }

    // Handle truck creation or lookup
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

    // Validate checklist if provided
    if (checklist.length > 0) {
      for (const item of checklist) {
        if (!item.productName || !item.unitPrice) {
          return res.status(400).json({
            error:
              "Checklist items must include 'productName' and 'unitPrice'.",
          });
        }
      }
    }

    // Create the project
    const project = new Project({
      serialNumber,
      customerId: customer._id,
      truckId: truck._id,
      notes,
      dynamicFields,
      checklist,
      companyId: req.user.companyId, // Add company association
    });

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (err) {
    console.error("Error creating project:", err.message);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId; // Get companyId from the user token

    // Ensure the project belongs to the same company
    const project = await Project.findOneAndDelete({ _id: id, companyId });

    if (!project) {
      return res
        .status(404)
        .json({ error: "Project not found or not authorized" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const { dailyTasks, checklist, ...rest } = req.body;

    if (dailyTasks && !Array.isArray(dailyTasks)) {
      return res.status(400).json({ error: "Invalid dailyTasks format." });
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, companyId },
      { $set: { ...rest, checklist, dailyTasks } },
      { new: true }
    )
      .populate("customerId", "name email phone address") // Populate customer fields
      .populate("truckId", "model") // Populate truck fields
      .populate("dailyTasks.taskId", "name"); // Populate task names

    if (!project) {
      return res
        .status(404)
        .json({ error: "Project not found or access denied." });
    }

    res.json(project);
  } catch (err) {
    console.error("Error updating project:", err.message);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.put("/:projectId/notes", authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { notes } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { notes },
      { new: true } // Return updated project
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    console.error("Error updating notes:", error);
    res.status(500).json({ error: "Failed to update notes" });
  }
});

module.exports = router;
