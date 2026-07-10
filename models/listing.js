const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: "",
    trim: true
  },
  image: {
    url: String,
    filename: String,
  },
  imageStatus: {
    type: String,
    enum: ["pending", "ready"],
    default: "ready"
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Middleware → delete reviews when a listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

// Fix 2: Database Indexes
listingSchema.index({ owner: 1 }); // Optimises fetching "my listings" queries
listingSchema.index({ location: 1 }); // Optimises geo/filter queries
listingSchema.index({ title: 'text', description: 'text' }); // Optimises text search

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
