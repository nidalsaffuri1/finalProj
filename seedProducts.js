const mongoose = require("mongoose");
const Product = require("./models/product");
const dotenv = require("dotenv");

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seedProducts = async () => {
  try {
    const existingProducts = await Product.find();
    if (existingProducts.length > 0) {
      console.log("Products already exist. Skipping seeding.");
      return;
    }

    const products = [
      { name: "Engine Oil", unitPrice: 25.99 },
      { name: "Brake Pads", unitPrice: 45.99 },
      { name: "Tires", unitPrice: 99.99 },
      { name: "Battery", unitPrice: 120.5 },
      { name: "Coolant", unitPrice: 15.75 },
    ];

    await Product.insertMany(products);
    console.log("Products seeded successfully.");
  } catch (err) {
    console.error("Error seeding products:", err);
  } finally {
    mongoose.disconnect();
  }
};

seedProducts();
