const express = require("express");
const Product = require("../models/product");
const authMiddleware = require("../middleware/authMiddltware");
const router = express.Router();

// Create a new product
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, quantityAvailable, unitPrice } = req.body;
    const product = new Product({
      name,
      description,
      quantityAvailable,
      unitPrice,
    });
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// Get all products
router.get("/", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Update a product
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description, quantityAvailable, unitPrice } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, quantityAvailable, unitPrice },
      { new: true }
    );
    res.json(updatedProduct);
  } catch (err) {
    console.error("Error updating product:", err.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete a product
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
