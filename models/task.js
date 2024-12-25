const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  name: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }, // Optional field for tracking completion time
  createdAt: { type: Date, default: Date.now },
});

// Middleware to set 'completedAt' when 'isCompleted' is set to true
taskSchema.pre("save", function (next) {
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Task", taskSchema);
