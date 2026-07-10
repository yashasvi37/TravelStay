const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    listing: { // Fix 1 & 2: added listing reference for efficient pagination and indexing
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    }
});

// Fix 2: Database Indexes
reviewSchema.index({ listing: 1 }); // Optimises fetching reviews by listing

module.exports=mongoose.model("Review",reviewSchema);