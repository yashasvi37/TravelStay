const User = require("../models/user");
const jwt = require("jsonwebtoken");
const env = require("../env");

const SECRET = env.JWT_SECRET;
const REFRESH_SECRET = env.REFRESH_SECRET;

// Helper to generate Access Token
const generateToken = (user) => {
  return jwt.sign({ _id: user._id, username: user.username, email: user.email }, SECRET, {
    expiresIn: "15m", // Fix 3: 15 minutes expiry
  });
};

// Helper to generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ _id: user._id }, REFRESH_SECRET, {
    expiresIn: "7d", // Fix 3: 7 days expiry
  });
};

// SIGNUP
module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    // Generate Tokens
    const token = generateToken(registeredUser);
    const refreshToken = generateRefreshToken(registeredUser);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000 // 15 mins
    });
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { _id: registeredUser._id, username: registeredUser.username, email: registeredUser.email }
    });

  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

// LOGIN
module.exports.login = (req, res) => {
  // Passport middleware checks credentials before this runs
  // If we are here, req.user is populated by Passport

  const token = generateToken(req.user);
  const refreshToken = generateRefreshToken(req.user);

  // Set HTTP-Only Cookies (Fix 3: CSRF and Token Storage)
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000 // 15 mins
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    message: "Logged in successfully",
    user: { _id: req.user._id, username: req.user.username, email: req.user.email }
  });
};

// LOGOUT
module.exports.logout = (req, res) => {
  // Clear the cookies (Fix 3: CSRF and Token Storage)
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};
