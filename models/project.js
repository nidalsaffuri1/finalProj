const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  truckId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Truck", // Reference to Truck schema
    required: false,
  },
  phoneNumber: { type: String, required: false },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  dynamicFields: [
    {
      name: { type: String, required: true },
      value: { type: String, required: false },
    },
  ],
});

module.exports = mongoose.model("Project", ProjectSchema);
