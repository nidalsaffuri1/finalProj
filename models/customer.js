const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Name is required
  email: { type: String, required: false },
  phone: { type: String, required: false },
  address: { type: String, required: false },
});

module.exports = mongoose.model("Customer", CustomerSchema);
