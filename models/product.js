const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  description: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }, // New Field
  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
