const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { verifyToken, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const os = require("os");
const path = require("path");
const csurf = require("csurf");
const csrfProtection = csurf({ cookie: true });

// Use local disk storage for async processing
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir());
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    verifyToken,
    csrfProtection, // Fix 3: CSRF protection on state-mutating route
    upload.single('listing[image]'), // Expecting 'listing[image]' field name
    // validateListing, // Note: Validating text fields might be tricky with Multipart/FormData depending on order.
    // Ideally validation happens after body parsing. 
    // In express, multer populates req.body.
    validateListing,
    wrapAsync(listingController.createListing)
  );

router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    verifyToken,
    csrfProtection, // Fix 3: CSRF protection on state-mutating route
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listingController.editListing)
  )
  .delete(
    verifyToken,
    csrfProtection, // Fix 3: CSRF protection on state-mutating route
    isOwner,
    wrapAsync(listingController.deleteListing)
  );

// Debug route (Optional, keeping for checks)
router.get("/debug", async (req, res) => {
  const listings = await Listing.find({});
  res.json({ count: listings.length, listings });
});

module.exports = router;
