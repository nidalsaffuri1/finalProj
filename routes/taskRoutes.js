const express = require("express");
const Task = require("../models/task");
const ProjectStatus = require("../models/projectStatus");
const authMiddleware = require("../middleware/authMiddltware");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// Helper function to check and update project status
const updateProjectStatus = async (projectId) => {
  try {
    const tasks = await Task.find({ projectId }); // Get all tasks for the project
    const allCompleted = tasks.every((task) => task.isCompleted); // Check if all tasks are completed
    const status = await ProjectStatus.findOneAndUpdate(
      { projectId },
      { isCompleted: allCompleted },
      { upsert: true, new: true } // Create a new status if it doesn't exist
    );
    console.log(`Updated project status for project ${projectId}:`, status);
  } catch (error) {
    console.error("Failed to update project status:", error.message);
  }
};

router.get("/available", authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.companyId; // Get company ID from the token
    const tasks = await Task.find({ companyId }); // Fetch tasks for the company
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching available tasks:", error.message);
    res.status(500).json({ error: "Failed to fetch available tasks." });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.query;
    const companyId = req.user.companyId; // Extract companyId from the token

    const tasks = projectId
      ? await Task.find({ projectId, companyId }) // Fetch tasks for the specific project and company
      : await Task.find({ companyId }); // Fetch all tasks for the company

    res.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    res.status(500).json({ message: "Failed to fetch tasks." });
  }
});

// Get all reusable tasks
router.get("/reusable", async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: null }); // Tasks not linked to any project
    res.json(tasks);
  } catch (error) {
    console.error("Failed to fetch reusable tasks:", error);
    res.status(500).json({ message: "Failed to fetch reusable tasks." });
  }
});

router.post("/", async (req, res) => {
  try {
    console.log("Request Body:", req.body); // Log the incoming request body

    const { name, projectId } = req.body;

    // Validate input
    if (!name) {
      console.error("Task name is required");
      return res.status(400).json({ error: "Task name is required" });
    }

    // Create a new task
    const newTask = new Task({ name, projectId });
    await newTask.save();

    console.log("Task Created:", newTask); // Log the created task
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error); // Log the exact error
    res.status(500).json({ error: "Failed to create task." });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { isCompleted } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isCompleted },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    await updateProjectStatus(task.projectId); // Update project status after updating a task
    res.json(task);
  } catch (err) {
    console.error("Error updating task:", err.message);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    await updateProjectStatus(task.projectId); // Update project status after deleting a task
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

module.exports = router;
