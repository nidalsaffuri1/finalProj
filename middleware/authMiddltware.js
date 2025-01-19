// const jwt = require("jsonwebtoken");

// const authMiddleware = (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ error: "Unauthorized" });

//   try {
//     const decoded = jwt.verify(token, "your_jwt_secret");
//     req.user = decoded;
//     next();
//   } catch (err) {
//     console.error("Invalid token:", err.message);
//     res.status(401).json({ error: "Unauthorized" });
//   }
// };

// module.exports = authMiddleware;
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    console.log(process.env.JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your actual secret key
    req.user = decoded; // Include companyId in req.user
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = authMiddleware;

