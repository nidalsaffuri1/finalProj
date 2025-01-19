const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; // Same as the one in auth.js

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
