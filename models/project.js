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
    ref: "Truck",
    required: false,
  },
  phoneNumber: { type: String, required: false },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },

  // Checklist field
  checklist: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      productName: { type: String },
      price: { type: Number },
      checked: { type: Boolean, default: false },
    },
  ],

  dynamicFields: [
    {
      name: { type: String, required: true },
      value: { type: String, required: false },
    },
  ],
});

module.exports =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);
