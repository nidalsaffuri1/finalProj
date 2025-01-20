const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Company = require("../models/company");

const router = express.Router();

// Company Login
router.post("/companies/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt for email:", email); // Log email
    console.log("Provided password:", password); // Log raw password

    const company = await Company.findOne({ email });
    if (!company) return res.status(404).json({ error: "Company not found" });

    console.log("Stored hashed password in DB:", company.password); // Log stored hash

    const isMatch = await bcrypt.compare(password, company.password);
    console.log("Password comparison result:", isMatch); // Log comparison result

    if (!isMatch) {
      console.error("Password mismatch for email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ companyId: company._id }, process.env.JWT_SECRET, {
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
    if (existingCompany)
      return res.status(400).json({ error: "Email already in use" });

    console.log("Raw password during registration:", password); // Log raw password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword); // Log hashed password

    const company = new Company({ name, email, password: hashedPassword });
    await company.save();

    res.status(201).json({ message: "Company registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
