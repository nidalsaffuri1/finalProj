const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Company = require("../models/company");

const router = express.Router();

// Company Login
router.post("/companies/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const company = await Company.findOne({ email });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Create JWT
    const token = jwt.sign({ companyId: company._id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.json({ token, companyName: company.name });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Company Registration
router.post("/companies/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) return res.status(400).json({ error: "Email already in use" });

    const company = new Company({ name, email, password });
    await company.save();

    res.status(201).json({ message: "Company registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
