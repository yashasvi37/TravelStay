const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");
const jwt = require("jsonwebtoken");
const env = require("./env");

// Middleware to verify JWT Token
module.exports.verifyToken = (req, res, next) => {
  // Extract token from HTTP-only cookie (Fix 3: CSRF and Token Storage)
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    // Must return 401 so the frontend interceptor knows to attempt a silent refresh
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

// Validate listing input with Joi
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Validate review input with Joi
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Ensure the logged-in user is the owner of the listing
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ error: "Listing not found!" });
  }

  // req.user is attached by verifyToken
  // req.user.id or req.user._id depending on what we put in the payload
  // We will assume payload has { _id: user._id } or similar.
  // Standardizing payload to have `_id`.

  if (!req.user || !listing.owner.equals(req.user._id)) {
    return res.status(403).json({ error: "You don't have permission to edit this listing!" });
  }

  next();
};

// Ensure logged-in user is the author of the review
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({ error: "Review not found!" });
  }

  if (!req.user || !review.author.equals(req.user._id)) {
    return res.status(403).json({ error: "You didn't create this review!" });
  }

  next();
};
