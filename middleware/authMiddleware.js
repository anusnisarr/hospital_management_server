import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = user;
    next(); 
  } catch (err) {
    return res.status(403).json({ err: err, message: "Invalid token" });
  }
};
