const mongoose = require("mongoose");
const ReusableTask = require("./models/reusableTask");
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedReusableTasks = async () => {
  try {
    const tasks = [
      { name: "Pre-Trip Inspection" },
      { name: "Check tires" },
      { name: "Inspect brakes" },
      { name: "Verify lights and signals" },
      { name: "Fluid level check (oil, coolant, etc.)" },
      { name: "Secure cargo" },
      { name: "Inspect cargo weight distribution" },
      { name: "Load documentation verification" },
      { name: "Fuel log" },
      { name: "Route compliance check" },
      { name: "Mileage recording" },
      { name: "Clean interior" },
      { name: "Unload cargo" },
      { name: "Report maintenance needs" },
      { name: "Change engine oil" },
      { name: "Replace air filter" },
      { name: "Check battery health" },
    ];

    await ReusableTask.insertMany(tasks);
    console.log("Reusable tasks seeded successfully.");
  } catch (error) {
    console.error("Error seeding reusable tasks:", error);
  } finally {
    mongoose.disconnect();
  }
};

seedReusableTasks();
