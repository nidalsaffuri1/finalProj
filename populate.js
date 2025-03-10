const Product = require("./models/product"); // Adjust the path if necessary

/**
 * Prepopulate default products for a given company.
 * @param {string} companyId - The ID of the company.
 */
const prepopulateProducts = async (companyId) => {
  try {
    const defaultProducts = [
      { name: "Engine Oil", unitPrice: 100, companyId },
      { name: "Tires", unitPrice: 200, companyId },
      { name: "Brake Pads", unitPrice: 300, companyId },
    ];

    // Insert default products into the database
    await Product.insertMany(defaultProducts);

    console.log(`Default products added for company: ${companyId}`);
  } catch (error) {
    console.error("Error prepopulating products:", error.message);
    throw new Error("Failed to prepopulate products");
  }
};

module.exports = prepopulateProducts;
