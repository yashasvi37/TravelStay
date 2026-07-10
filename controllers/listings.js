const Listing = require("../models/listing");
const { deleteImage } = require("../utils/cloudinaryUtils");
const uploadQueue = require("../queues/uploadQueue");
const logger = require("../utils/logger");
const { paginateQuery } = require("../utils/pagination"); // Fix 1: Pagination

// INDEX — Show all listings
module.exports.index = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const cursor = req.query.cursor;

    if (limit > 100) {
      return res.status(400).json({ error: "Limit cannot exceed 100" });
    }

    const result = await paginateQuery(Listing, {}, cursor, limit);
    res.json(result);
  } catch (error) {
    logger.error({ err: error }, "Failed to load listings");
    res.status(500).json({ error: "Failed to load listings." });
  }
};

// SHOW — Show details of one listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  try {
    // Fix 1: Removing populate("reviews") as they are now fetched via their own paginated endpoint
    const listing = await Listing.findById(id).populate("owner");

    if (!listing) {
      return res.status(404).json({ error: "Listing not found!" });
    }

    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: "Failed to load listing." });
  }
};

// CREATE — Create a new listing
module.exports.createListing = async (req, res) => {
  // Validations are handled by middleware (validateListing) before this

  try {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id; // Req.user from JWT

    if (req.file) {
      newListing.imageStatus = "pending";
    } else {
      return res.status(400).json({ error: "Image is required!" });
    }

    await newListing.save();

    // Enqueue the job for background processing
    if (req.file) {
      uploadQueue.add({
        listingId: newListing._id,
        filePath: req.file.path,
        folderName: "TravelStay_Listings"
      });
    }

    res.status(201).json({ message: "New listing created! Image processing in background.", listing: newListing });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// UPDATE — Update a listing
module.exports.editListing = async (req, res) => {
  const { id } = req.params;

  try {
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found!" });
    }

    // Update fields
    if (req.body.listing) {
      Object.assign(listing, req.body.listing);
    }

    if (req.file) {
      // Delete old image
      if (listing.image && listing.image.url) {
        try {
          await deleteImage(listing.image.url);
        } catch (e) { logger.error({ err: e }, "Cloudinary delete failed"); } // Fix 4: Structured Logging
      }
      listing.imageStatus = "pending";
      await listing.save();

      uploadQueue.add({
        listingId: listing._id,
        filePath: req.file.path,
        folderName: "TravelStay_Listings"
      });
    } else {
      await listing.save();
    }

    res.json({ message: "Listing updated successfully!", listing });
  } catch (error) {
    res.status(400).json({ error: "Failed to update listing." });
  }
};

// DELETE — Delete a listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  try {
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found!" });
    }

    if (listing.image && listing.image.url) {
      try {
        await deleteImage(listing.image.url);
      } catch (e) { logger.error({ err: e }, "Cloudinary delete failed"); } // Fix 4: Structured Logging
    }

    await Listing.findByIdAndDelete(id);
    res.json({ message: "Listing deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete listing." });
  }
};
