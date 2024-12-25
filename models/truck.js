// const mongoose = require("mongoose");

// const truckSchema = new mongoose.Schema({
//   model: { type: String, required: true },
//   registrationNumber: { type: String, required: true },
//   weightCapacity: { type: Number },
//   owner: { type: String },
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Truck", truckSchema);

const mongoose = require("mongoose");

const truckSchema = new mongoose.Schema({
  model: { type: String, required: false },
  registrationNumber: { type: String, required: false },
  weightCapacity: { type: Number },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }, // Link to Customers
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Truck", truckSchema);
