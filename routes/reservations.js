const express = require("express");
const router = express.Router({ mergeParams: true });
const reservations = require("../controllers/reservations");
const { verifyToken } = require("../middleware");
const csurf = require("csurf");
const csrfProtection = csurf({ cookie: true });

// Routes for /api/reservations
router.get("/", verifyToken, reservations.getUserReservations);

// Routes for /api/listings/:id/reservations
router.post("/", verifyToken, csrfProtection, reservations.createReservation);

module.exports = router;
