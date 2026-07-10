const Listing = require("../models/listing");
const Review = require("../models/review");
const logger = require("../utils/logger");
const { paginateQuery } = require("../utils/pagination");

// GET Reviews for a listing (Fix 1: Pagination)
module.exports.getReviews = async (req, res) => {
  const { id } = req.params;
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const cursor = req.query.cursor;

    if (limit > 100) {
      return res.status(400).json({ error: "Limit cannot exceed 100" });
    }

    const filter = { listing: id };
    const populateOpts = { path: "author", select: "username" }; // Populate author details

    const result = await paginateQuery(Review, filter, cursor, limit, populateOpts);
    res.json(result);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch reviews");
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
};

// CREATE Review
module.exports.createReview = async (req, res) => {
  const { id } = req.params;

  if (!req.body.review) {
    return res.status(400).json({ error: "Review data is required." });
  }

  try {
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ error: "Listing not found." });

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    newReview.listing = id; // Fix 1 & 2: Save listing reference

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.status(201).json({ message: "New review created!", review: newReview });
  } catch (error) {
    logger.error({ err: error }, "Failed to create review");
    res.status(500).json({ error: "Failed to create review." });
  }
};

// DELETE Review
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  try {
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.json({ message: "Review deleted successfully!" });
  } catch (error) {
    logger.error({ err: error }, "Failed to delete review");
    res.status(500).json({ error: "Failed to delete review." });
  }
};
