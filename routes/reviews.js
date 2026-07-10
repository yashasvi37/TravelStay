const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { validateReview, verifyToken, isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
const csurf = require("csurf");
const csrfProtection = csurf({ cookie: true });

// GET Reviews (Fix 1: Pagination)
router.get("/", wrapAsync(reviewController.getReviews));

// POST Review
router.post("/",
  verifyToken,
  csrfProtection, // Fix 3: CSRF protection on state-mutating route
  validateReview,
  wrapAsync(reviewController.createReview)
);

// DELETE Review
router.delete("/:reviewId",
  verifyToken,
  csrfProtection, // Fix 3: CSRF protection on state-mutating route
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;