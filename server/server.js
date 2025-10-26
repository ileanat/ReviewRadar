import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// store users in a JSON file for now
const USERS_PATH = path.join(__dirname, "users.json");
if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, JSON.stringify([]));

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const PORT = process.env.PORT || 5000;

// helpers
const readUsers = () => JSON.parse(fs.readFileSync(USERS_PATH, "utf-8"));
const writeUsers = (users) => fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));

const auth = (req, res, next) => {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  try {
    if (!token) return res.status(401).json({ error: "No token" });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Register
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  const users = readUsers();
  if (users.find((u) => u.email === email)) return res.status(409).json({ error: "Email already registered" });

  const hash = await bcrypt.hash(password, 10);
  const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
  users.push({ id, email, passwordHash: hash, createdAt: new Date().toISOString() });
  writeUsers(users);

  res.status(201).json({ ok: true });
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = readUsers().find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });
  res.json({ token, user: { id: user.id, email: user.email } });
});

// Example protected route
app.get("/api/me", auth, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.get("/", (_req, res) => {
  res.send("Auth API is running. Try GET /api/health");
});

app.listen(PORT, "0.0.0.0", () => console.log(`Auth API on http://0.0.0.0:${PORT}`));
