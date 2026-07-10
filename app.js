const env = require("./env"); // Fix 5: Startup Environment Validation (must be first)

const express = require("express");
const app = express();
app.set("trust proxy", 1); // Fix: Trust Render's reverse proxy so Secure cookies work

const mongoose = require("mongoose");
const cors = require("cors");
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const pinoHttp = require("pino-http");
const logger = require("./utils/logger");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { apiLimiter } = require("./utils/rateLimiters.js");

// Database connection
const dburl = env.MONGO_URI;

const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
const reservationRouter = require("./routes/reservations.js");

// HTTP Security Headers (Fix: helmet must be first middleware)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      },
    },
  })
);

// Middleware
const corsOptions = {
  origin: env.FRONTEND_URL, // Fix: strict CORS restriction
  credentials: true,
};
app.use(cors(corsOptions)); // Allow Cross-Origin requests
app.use(pinoHttp({ logger })); // Fix 4: Structured Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies

// Passport Configuration (Stateless)
app.use(passport.initialize());
passport.use(new LocalStrategy(User.authenticate()));

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to TravelStay API" });
});

// Routes
// Note: We are using /api/listings to distinguish from old routes if needed, 
// but for the frontend transition, the paths in routers need to match.
// The routers themselves define the subpaths. 
// listingRouter handles "/" -> so app.use("/listings") makes it "/listings/"
// Let's keep the existing path structure for now but return JSON.

// Apply API rate limiter to data endpoints (Fix 1: rate limit)
app.use("/listings", apiLimiter, listingRouter);
app.use("/listings/:id/reviews", apiLimiter, reviewsRouter);
app.use("/listings/:id/reservations", apiLimiter, reservationRouter);
app.use("/reservations", apiLimiter, reservationRouter);
app.use("/", userRouter); // User router has its own specific limiters for auth

// CSRF Token endpoint (Fix 3: CSRF)
const csurf = require("csurf");
const csrfProtection = csurf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  } 
});
app.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// 404 handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found!"));
});

// Error handler
app.use((err, req, res, next) => {
  // Passport with failWithError:true uses err.status (not err.statusCode)
  let statusCode = err.statusCode || err.status || 500;
  
  if (err.name === "AuthenticationError" || err.message === "Unauthorized") {
    statusCode = 401;
  }

  const message = err.message || "Something went wrong!";

  if (statusCode >= 500) {
    logger.error({ err }, err.stack || err.message);
  } else {
    logger.warn({ statusCode, message }, "Client error");
  }

  res.status(statusCode).json({ error: message, statusCode });
});

// Connect to MongoDB
async function main() {
  try {
    const mongooseOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };
    
    if (dburl.includes("mongodb+srv://")) {
      mongooseOptions.tls = true;
      mongooseOptions.tlsAllowInvalidCertificates = true;
    }

    await mongoose.connect(dburl, mongooseOptions);
    logger.info(`✅ Connected to MongoDB at ${dburl}`);

    const port = env.PORT || 3001;
    app.listen(port, "0.0.0.0", () => {
      logger.info(`🚀 API Server listening on port ${port}`);
    });
  } catch (error) {
    logger.error({ err: error }, "❌ Failed to connect to MongoDB");
    process.exit(1); // Fix 3: Crash process on failed initial connection
  }
}

if (require.main === module) {
  main();
}

module.exports = app;
