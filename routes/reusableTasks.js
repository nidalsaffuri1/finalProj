const express = require("express");
const router = express.Router();
const ReusableTask = require("../models/reusableTask");

// Fetch all reusable tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await ReusableTask.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching reusable tasks:", error);
    res.status(500).json({ error: "Failed to fetch reusable tasks." });
  }
});

// Create a new reusable task
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Task name is required." });
    }

    const newTask = new ReusableTask({ name });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating reusable task:", error);
    res.status(500).json({ error: "Failed to create reusable task." });
  }
});

// Delete a reusable task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTask = await ReusableTask.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting reusable task:", error);
    res.status(500).json({ error: "Failed to delete reusable task." });
  }
});

module.exports = router;
