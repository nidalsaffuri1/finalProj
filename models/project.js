const mongoose = require("mongoose");

// const ProjectSchema = new mongoose.Schema({
//   serialNumber: { type: String, required: true },
//   customerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Customer",
//     required: true,
//   },
//   truckId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Truck",
//     required: false,
//   },
//   notes: { type: String, default: "" },
//   checklist: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
//       productName: { type: String },
//       price: { type: Number },
//       quantity: { type: Number, default: 1 },
//       checked: { type: Boolean, default: false },
//     },
//   ],
//   dynamicFields: [
//     {
//       name: { type: String, required: true },
//       value: { type: String, required: false },
//     },
//   ],
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports =
//   mongoose.models.Project || mongoose.model("Project", ProjectSchema);
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
  notes: { type: String, default: "" },
  checklist: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      productName: { type: String },
      price: { type: Number },
      quantity: { type: Number, default: 1 },
      checked: { type: Boolean, default: false },
    },
  ],
  dynamicFields: [
    {
      name: { type: String, required: true },
      value: { type: String, required: false },
    },
  ],
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  }, // Add the companyId field
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Project || mongoose.model("Project", ProjectSchema);
