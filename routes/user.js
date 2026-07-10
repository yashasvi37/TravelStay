const express = require("express");
const router = express.Router();
const passport = require("passport");
const users = require("../controllers/users");
const { authLimiter } = require("../utils/rateLimiters.js");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const validateRequest = require("../middleware/validate.js");
const { signupSchema, loginSchema } = require("../schemas/authSchema.js");
const env = require("../env");

const SECRET = env.JWT_SECRET;
const REFRESH_SECRET = env.REFRESH_SECRET;

// POST /auth/refresh (Fix 3: JWT Hardening)
router.post("/auth/refresh", async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token provided." });
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await User.findById(decoded._id);
    
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token." });
    }

    // Generate new Access Token
    const newToken = jwt.sign({ _id: user._id, username: user.username, email: user.email }, SECRET, {
      expiresIn: "15m",
    });

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000
    });

    res.json({ message: "Token refreshed successfully" });
  } catch (ex) {
    return res.status(403).json({ error: "Invalid or expired refresh token." });
  }
});

// SIGNUP route (Only POST)
// Apply auth rate limiter (Fix 1: rate limit)
router.post("/signup", authLimiter, validateRequest(signupSchema), users.signup);

// LOGIN route (Only POST)
// Use session: false for JWT
// Apply auth rate limiter (Fix 1: rate limit)
router.post("/login",
  authLimiter,
  validateRequest(loginSchema),
  passport.authenticate("local", { session: false, failWithError: true }),
  users.login
);

// LOGOUT
router.post("/logout", users.logout); // Logout is typically a POST (state change) or client-side only

module.exports = router;
