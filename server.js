const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("dotenv").config();
const cors = require("cors");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projectRoutes");
const customerRoutes = require("./routes/customerRoutes");
const truckRoutes = require("./routes/truckRoutes");
const productRoutes = require("./routes/productRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectStatusRoutes = require("./routes/projectStatusRoutes");
const reusableTasksRoutes = require("./routes/reusableTasks");
const authRoutes = require("./routes/auth");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

// Routes
app.use("/reusable-tasks", reusableTasksRoutes);
app.use("/projects", projectRoutes);
app.use("/projectStatus", projectStatusRoutes);
app.use("/products", productRoutes);
app.use("/tasks", taskRoutes);
app.use("/trucks", truckRoutes);
app.use("/customers", customerRoutes);
app.use("/auth", authRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// API test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Listen on a port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
