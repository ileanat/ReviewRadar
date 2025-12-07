import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "ballz";

// Helper to create token
function createToken(user) {
  return jwt.sign(
    { userId: user._id, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: "User already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, passwordHash });

    const token = createToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // set true in production with HTTPS
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = createToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res
    .clearCookie("token")
    .json({ message: "Logged out." });
});

// GET CURRENT USER
router.get("/me", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(200).json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ user: { id: decoded.userId, username: decoded.username } });
  } catch (err) {
    return res.status(200).json({ user: null });
  }
});

export default router;
