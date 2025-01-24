// const mongoose = require("mongoose");

// const ProductSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   unitPrice: { type: Number, required: true },
//   description: { type: String },
//   companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }, // New Field
//   createdAt: { type: Date, default: Date.now },
// });

// module.exports =
//   mongoose.models.Product || mongoose.model("Product", ProductSchema);
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true, // Ensure every product is associated with a company
  },
  name: {
    type: String,
    required: true, // Product name is mandatory
  },
  unitPrice: {
    type: Number,
    required: true, // Unit price is mandatory
  },
  description: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
