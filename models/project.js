const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  truckModel: { type: String, required: false },
  weight: { type: Number, required: false },
  phoneNumber: { type: String, required: false },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  dynamicFields: [
    {
      name: { type: String, required: true },
      value: { type: String, required: false },
    },
  ], // Array to store dynamic fields
});

module.exports = mongoose.model("Project", ProjectSchema);
