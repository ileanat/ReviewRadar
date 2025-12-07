import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "ballz";

function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
}

export default requireAuth;
