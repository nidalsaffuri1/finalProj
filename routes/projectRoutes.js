const express = require("express");
const Project = require("../models/project");
const authenticateToken = require("../middleware/authenticateToken");
const Truck = require("../models/truck");
const Customer = require("../models/customer");
const Product = require("../models/product");
const Task = require("../models/task");
const router = express.Router();

// Fetch all projects (with pagination, sorting, and search)
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

    // Get the companyId from the authenticated user's token
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

    const projects = await Project.find(query)
      .populate("customerId", "name email phone address")
      .populate("truckId", "model")
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

// router.get("/", authenticateToken, async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       sortBy = "createdAt",
//       order = "desc",
//       search = "",
//       userId,
//     } = req.query;

//     const sortOrder = order === "asc" ? 1 : -1;

//     const query = {};
//     if (userId) {
//       query.userId = userId; // Filter by userId
//     }
//     if (search) {
//       const customers = await Customer.find({
//         name: { $regex: search, $options: "i" },
//       });
//       const customerIds = customers.map((customer) => customer._id);

//       query.$or = [
//         { serialNumber: { $regex: search, $options: "i" } },
//         { truckModel: { $regex: search, $options: "i" } },
//         { customerId: { $in: customerIds } },
//       ];
//     }

//     const projects = await Project.find(query)
//       .populate("customerId", "name email phone address")
//       .populate("truckId", "model")
//       .sort({ [sortBy]: sortOrder })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit));

//     // Fetch task completion for each project
//     const projectIds = projects.map((project) => project._id);
//     const taskAggregation = await Task.aggregate([
//       { $match: { projectId: { $in: projectIds } } },
//       {
//         $group: {
//           _id: "$projectId",
//           totalTasks: { $sum: 1 },
//           completedTasks: {
//             $sum: { $cond: ["$isCompleted", 1, 0] },
//           },
//         },
//       },
//     ]);

//     // Map task data to projects
//     const projectStatusMap = taskAggregation.reduce((acc, taskData) => {
//       acc[taskData._id] = {
//         isCompleted: taskData.totalTasks === taskData.completedTasks,
//         hasTasks: taskData.totalTasks > 0,
//       };
//       return acc;
//     }, {});

//     // Attach status to projects
//     const projectsWithStatus = projects.map((project) => ({
//       ...project.toObject(),
//       isCompleted: projectStatusMap[project._id]?.isCompleted ?? null,
//       hasTasks: projectStatusMap[project._id]?.hasTasks ?? false,
//     }));

//     const totalProjects = await Project.countDocuments(query);

//     res.json({
//       projects: projectsWithStatus,
//       totalPages: Math.ceil(totalProjects / limit),
//       totalProjects,
//       currentPage: parseInt(page),
//     });
//   } catch (err) {
//     console.error("Error fetching projects:", err.message);
//     res.status(500).json({ error: "Failed to fetch projects" });
//   }
// });

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

// router.get("/:id", async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id)
//       .populate("customerId", "name email phone address")
//       .populate("checklist.productId", "name unitPrice");

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     // Explicitly include truck model and weight capacity if truck exists
//     if (project.truckId) {
//       const truck = await Truck.findById(project.truckId);
//       if (truck) {
//         project.truckModel = truck.model;
//         project.weightCapacity = truck.weightCapacity;
//       }
//     }

//     res.json(project);
//   } catch (err) {
//     console.error("Error fetching project by ID:", err.message);
//     res.status(500).json({ error: "Failed to fetch project by ID" });
//   }
// });

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

// router.post("/", async (req, res) => {
//   try {
//     const {
//       serialNumber,
//       customerId, // Use customerId directly if passed
//       customerName,
//       customerEmail,
//       customerPhone,
//       customerAddress,
//       truckModel,
//       truckRegistrationNumber,
//       truckWeightCapacity,
//       notes,
//       dynamicFields = [],
//     } = req.body;

//     if (!serialNumber) {
//       return res.status(400).json({ error: "Serial Number is required." });
//     }

//     let customer;

//     // 🔹 If customerId is provided, fetch the existing customer
//     if (customerId) {
//       customer = await Customer.findById(customerId);
//       if (!customer) {
//         return res.status(404).json({ error: "Customer not found." });
//       }
//     } else {
//       // 🔹 Otherwise, find or create a new customer by name
//       if (!customerName) {
//         return res.status(400).json({ error: "Customer name is required." });
//       }

//       customer = await Customer.findOne({ name: customerName });
//       if (!customer) {
//         customer = new Customer({
//           name: customerName,
//           email: customerEmail,
//           phone: customerPhone,
//           address: customerAddress,
//         });
//         customer = await customer.save();
//       }
//     }

//     // Step 2: Find or create the truck
//     let truck = await Truck.findOne({
//       registrationNumber: truckRegistrationNumber,
//     });
//     if (!truck) {
//       truck = new Truck({
//         model: truckModel,
//         registrationNumber: truckRegistrationNumber,
//         weightCapacity: truckWeightCapacity,
//         owner: customer._id,
//       });
//       truck = await truck.save();
//     }

//     // Step 3: Fetch existing products ONCE
//     const products = await Product.find();

//     const checklist = req.body.checklist || []; // Use checklist from the request body, or start with an empty array

//     // Step 5: Create the project with the checklist
//     const project = new Project({
//       serialNumber,
//       customerId: customer._id,
//       truckId: truck._id,
//       notes,
//       dynamicFields,
//       checklist, // Add checklist ONCE
//     });

//     const savedProject = await project.save();
//     res.status(201).json(savedProject);
//   } catch (err) {
//     console.error("Error creating project:", err.message);
//     res.status(500).json({ error: "Failed to create project" });
//   }
// });

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const result = await Project.findOneAndDelete({
      _id: req.params.id,
      companyId,
    });

    if (!result) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json({ message: "Project deleted successfully." });
  } catch (err) {
    console.error("Error deleting project:", err.message);
    res.status(500).json({ error: "Failed to delete project." });
  }
});

// router.delete("/:id", async (req, res) => {
//   try {
//     const result = await Project.findByIdAndDelete(req.params.id);
//     if (!result) {
//       return res.status(404).json({ error: "Project not found." });
//     }
//     res.json({ message: "Project deleted successfully." });
//   } catch (err) {
//     console.error("Error deleting project:", err.message);
//     res.status(500).json({ error: "Failed to delete project." });
//   }
// });
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.companyId; // Authenticated user's company ID
    const { checklist, ...rest } = req.body;

    // Ensure the project belongs to the authenticated company
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, companyId },
      { $set: { ...rest, checklist } },
      { new: true }
    ).populate("checklist.productId", "name unitPrice");

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

module.exports = router;
