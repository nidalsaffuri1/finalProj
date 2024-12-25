const express = require("express");
const ProjectStatus = require("../models/projectStatus");
const router = express.Router();

// Create a status entry for a project
router.post("/", async (req, res) => {
  try {
    const { projectId, status } = req.body;
    const projectStatus = new ProjectStatus({ projectId, status });
    const savedStatus = await projectStatus.save();
    res.status(201).json(savedStatus);
  } catch (err) {
    console.error("Error creating project status:", err.message);
    res.status(500).json({ error: "Failed to create project status" });
  }
});

// Get status for a specific project
router.get("/:projectId", async (req, res) => {
  try {
    const status = await ProjectStatus.findOne({
      projectId: req.params.projectId,
    });
    if (!status) {
      return res.status(404).json({ error: "Status not found" });
    }
    res.json(status);
  } catch (err) {
    console.error("Error fetching project status:", err.message);
    res.status(500).json({ error: "Failed to fetch project status" });
  }
});

// Update project status
router.patch("/:projectId", async (req, res) => {
  try {
    const { status } = req.body;
    const updatedStatus = await ProjectStatus.findOneAndUpdate(
      { projectId: req.params.projectId },
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!updatedStatus) {
      return res.status(404).json({ error: "Status not found" });
    }
    res.json(updatedStatus);
  } catch (err) {
    console.error("Error updating project status:", err.message);
    res.status(500).json({ error: "Failed to update project status" });
  }
});

module.exports = router;
