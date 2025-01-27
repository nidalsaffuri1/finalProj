const express = require("express");
const Product = require("../models/product");
const authMiddleware = require("../middleware/authMiddltware");
const router = express.Router();

// Create a new product
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, quantityAvailable, unitPrice } = req.body;
    const companyId = req.user.companyId; // Extract companyId from token

    // Validate required fields
    if (!name || !unitPrice) {
      return res
        .status(400)
        .json({ error: "Name and unitPrice are required fields." });
    }

    // Create the product with the companyId
    const product = new Product({
      companyId, // Associate the product with the company
      name,
      description,
      quantityAvailable,
      unitPrice,
    });

    // Save the product to the database
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Error creating product:", err.message);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const companyId = req.user.companyId; // Extract companyId from the token

    const products = await Product.find({ companyId }); // Fetch products specific to the company
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Update a product
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { checklist, ...rest } = req.body; // Destructure checklist from the request body

    // Update the project with the provided data
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: { ...rest, checklist } }, // Update the checklist and other fields
      { new: true } // Return the updated document
    ).populate("checklist.productId", "name unitPrice"); // Populate product details in checklist

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found." });
    }

    res.json(updatedProject); // Send the updated project back to the client
  } catch (err) {
    console.error("Error updating project:", err.message);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Delete a product
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const companyId = req.user.companyId; // Authenticated user's company ID

    // Ensure the product belongs to the authenticated company
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      companyId,
    });

    if (!product) {
      return res
        .status(404)
        .json({ error: "Product not found or access denied." });
    }

    res.json({ message: "Product deleted successfully." });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    res.status(500).json({ error: "Failed to delete product." });
  }
});

module.exports = router;
