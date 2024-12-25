const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: false },
  description: { type: String },
  quantityAvailable: { type: Number, default: 0 },
  unitPrice: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", ProductSchema);
