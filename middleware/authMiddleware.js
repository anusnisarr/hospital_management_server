import jwt from "jsonwebtoken";
import { refreshToken } from "../controllers/auth.controller.js";
import {generateAccessToken} from "../controllers/auth.controller.js";

export const authenticateToken = async (req, res, next) => {

  console.log("req.cookies", req.cookies);

  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = user;
    next(); 
  } catch (err) {
    return res.status(401).json({err, code: "ACCESS_TOKEN_EXPIRED", message: "Token Expired" });
  }

};
