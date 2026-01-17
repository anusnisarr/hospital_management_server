// controllers/auth.controller.j
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"
import { log } from "console";

export const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: "30m" });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

const hashRefreshToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

export const refreshToken = async (req, res) => {
  
  const refreshToken = req.cookies.refreshToken;
  

  if (!refreshToken)
    return res.status(401).json({ code: "REFRESH_TOKEN_MISSING", message: "No refresh token" });

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

  try {
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const newAccessToken = generateAccessToken({ id: user._id });
  
    return res.status(200).json({
      message: "Authoirzed Successful",
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (err) {
    res.status(403).json({ code: "REFRESH_TOKEN_EXPIRED" , error: err , message: "Invalid refresh token" });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;    

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    const refreshToken = generateRefreshToken({ id: user._id });
    const accessToken = generateAccessToken({ id: user._id });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error while registering" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });
  
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      accessToken
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error while logging in" });
  }
};