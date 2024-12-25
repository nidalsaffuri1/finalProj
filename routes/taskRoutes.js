const express = require("express");
const Task = require("../models/task");
const ProjectStatus = require("../models/projectStatus");
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

// Fetch tasks by project ID
router.get("/", async (req, res) => {
  try {
    const { projectId } = req.query; // Get the projectId from the query

    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    const tasks = await Task.find({ projectId }); // Fetch tasks linked to the project ID
    res.json(tasks); // Return the tasks
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// Create a task
router.post("/", async (req, res) => {
  try {
    const { projectId, name } = req.body;

    if (!projectId || !name) {
      return res
        .status(400)
        .json({ error: "Project ID and Task name are required" });
    }

    const task = new Task({ projectId, name });
    const savedTask = await task.save();

    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Error creating task:", err.message);
    res.status(500).json({ error: "Failed to create task" });
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
