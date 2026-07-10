const rateLimit = require("express-rate-limit");
const { MemoryStore } = require("express-rate-limit");

// Prevent brute-force login/signup and credential stuffing attacks
module.exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // Limit each IP to 25 requests per `window`
  message: { error: "Too many requests. Try again later." },
  store: new MemoryStore(), // Explicitly configured MemoryStore as per instructions
});

// Prevent DoS/DDoS attacks and resource exhaustion on API endpoints
module.exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { error: "Too many requests. Try again later." },
  store: new MemoryStore(), // Explicitly configured MemoryStore as per instructions
});
