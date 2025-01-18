const express = require("express");
const Project = require("../models/project");
const Truck = require("../models/truck");
const Customer = require("../models/customer");
const Product = require("../models/product");
const Task = require("../models/task");
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
      .populate("truckId", "model")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Fetch task completion for each project
    const projectIds = projects.map((project) => project._id);
    const taskAggregation = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      {
        $group: {
          _id: "$projectId",
          totalTasks: { $sum: 1 },
          completedTasks: {
            $sum: { $cond: ["$isCompleted", 1, 0] },
          },
        },
      },
    ]);

    // Map task data to projects
    const projectStatusMap = taskAggregation.reduce((acc, taskData) => {
      acc[taskData._id] = {
        isCompleted: taskData.totalTasks === taskData.completedTasks,
        hasTasks: taskData.totalTasks > 0,
      };
      return acc;
    }, {});

    // Attach status to projects
    const projectsWithStatus = projects.map((project) => ({
      ...project.toObject(),
      isCompleted: projectStatusMap[project._id]?.isCompleted ?? null,
      hasTasks: projectStatusMap[project._id]?.hasTasks ?? false,
    }));

    const totalProjects = await Project.countDocuments(query);

    res.json({
      projects: projectsWithStatus,
      totalPages: Math.ceil(totalProjects / limit),
      totalProjects,
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("Error fetching projects:", err.message);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});
// router.get("/", async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       sortBy = "createdAt",
//       order = "desc",
//       search = "",
//     } = req.query;

//     const sortOrder = order === "asc" ? 1 : -1;

//     const query = {};

//     if (search) {
//       // Step 1: Find customers by name
//       const customers = await Customer.find({
//         name: { $regex: search, $options: "i" },
//       });
//       const customerIds = customers.map((customer) => customer._id);

//       // Step 2: Find trucks by model
//       const trucks = await Truck.find({
//         model: { $regex: search, $options: "i" },
//       });
//       const truckIds = trucks.map((truck) => truck._id);

//       // Step 3: Search projects
//       query.$or = [
//         { serialNumber: { $regex: search, $options: "i" } }, // Serial Number
//         { customerId: { $in: customerIds } }, // Customer Name
//         { truckId: { $in: truckIds } }, // Truck Model
//         {
//           createdAt: {
//             $regex: search,
//             $options: "i",
//           },
//         }, // Created At as string
//       ];
//     }

//     // Fetch projects matching the query
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

// Fetch a single project by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const project = await Project.findById(req.params.id)
//       .populate("customerId", "name email phone address")
//       .populate("checklist.productId", "name unitPrice"); // Ensure proper population

//     if (!project) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     res.json(project);
//   } catch (err) {
//     console.error("Error fetching project by ID:", err.message);
//     res.status(500).json({ error: "Failed to fetch project by ID" });
//   }
// });
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("customerId", "name email phone address")
      .populate("checklist.productId", "name unitPrice");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Explicitly include truck model and weight capacity if truck exists
    if (project.truckId) {
      const truck = await Truck.findById(project.truckId);
      if (truck) {
        project.truckModel = truck.model;
        project.weightCapacity = truck.weightCapacity;
      }
    }

    res.json(project);
  } catch (err) {
    console.error("Error fetching project by ID:", err.message);
    res.status(500).json({ error: "Failed to fetch project by ID" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      serialNumber,
      customerId, // Use customerId directly if passed
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

    let customer;

    // 🔹 If customerId is provided, fetch the existing customer
    if (customerId) {
      customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found." });
      }
    } else {
      // 🔹 Otherwise, find or create a new customer by name
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
    // const checklist = products.map((product) => ({
    //   productId: product._id,
    //   productName: product.name,
    //   price: product.unitPrice,
    //   checked: false,
    // }));
    const checklist = req.body.checklist || []; // Use checklist from the request body, or start with an empty array

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
// router.put("/:id", async (req, res) => {
//   try {
//     const { checklist, ...updateData } = req.body;

//     const updatedProject = await Project.findByIdAndUpdate(
//       req.params.id,
//       {
//         ...updateData,
//         checklist,
//         dynamicFields, // Ensure dynamic fields are handled
//         $set: {
//           "truck.model": truckModel,
//           "truck.weightCapacity": weightCapacity,
//         },
//       },
//       { new: true }
//     )
//       .populate("checklist.productId", "name unitPrice")
//       .populate("customerId", "name email phone address"); // <-- Re-populate customer

//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     res.json(updatedProject);
//   } catch (err) {
//     console.error("Error updating project:", err.message);
//     res.status(500).json({ error: "Failed to update project" });
//   }
// });
// router.put("/:id", async (req, res) => {
//   try {
//     const {
//       checklist,
//       dynamicFields,
//       truckModel,
//       weightCapacity,
//       ...updateData
//     } = req.body;

//     const updatedProject = await Project.findByIdAndUpdate(
//       req.params.id,
//       {
//         ...updateData,
//         checklist, // Save checklist
//         dynamicFields,
//         $set: {
//           "truck.model": truckModel,
//           "truck.weightCapacity": weightCapacity,
//         },
//       },
//       { new: true } // Return the updated document
//     )
//       .populate("checklist.productId", "name unitPrice")
//       .populate("customerId", "name email phone address");

//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     res.json(updatedProject);
//   } catch (err) {
//     console.error("Error updating project:", err.message);
//     res.status(500).json({ error: "Failed to update project" });
//   }
// });

router.delete("/:id", async (req, res) => {
  try {
    const result = await Project.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Project not found." });
    }
    res.json({ message: "Project deleted successfully." });
  } catch (err) {
    console.error("Error deleting project:", err.message);
    res.status(500).json({ error: "Failed to delete project." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      serialNumber,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      truckId,
      truckModel,
      weightCapacity,
      notes,
      checklist,
      dynamicFields,
    } = req.body;

    // Update customer details if provided
    if (customerId) {
      await Customer.findByIdAndUpdate(customerId, {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
      });
    }

    // Update truck details if truckId is provided
    if (truckId) {
      await Truck.findByIdAndUpdate(truckId, {
        model: truckModel,
        weightCapacity,
      });
    }

    // Update the project details
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        serialNumber,
        truckId, // Ensure truckId is updated
        notes,
        checklist,
        dynamicFields,
      },
      { new: true }
    )
      .populate("checklist.productId", "name unitPrice")
      .populate("customerId", "name email phone address");

    console.log("Updated Project in DB:", updatedProject);

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (err) {
    console.error("Error updating project:", err.message);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// router.put("/:id", async (req, res) => {
//   try {
//     const { checklist, ...updateData } = req.body;

//     const updatedProject = await Project.findByIdAndUpdate(
//       req.params.id,
//       { ...updateData, checklist },
//       { new: true }
//     )
//       .populate("checklist.productId", "name unitPrice") // Populate product details
//       .populate("customerId", "name email phone address");

//     if (!updatedProject) {
//       return res.status(404).json({ message: "Project not found" });
//     }

//     res.json(updatedProject);
//   } catch (err) {
//     console.error("Error updating project:", err.message);
//     res.status(500).json({ error: "Failed to update project" });
//   }
// });

module.exports = router;
