const mongoose = require("mongoose");

const projectStatusSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  status: { type: String, required: true, default: "In Progress" },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ProjectStatus", projectStatusSchema);
