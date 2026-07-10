const Reservation = require("../models/reservation");
const Listing = require("../models/listing");

module.exports.createReservation = async (req, res) => {
    try {
        const { id } = req.params; // Listing ID
        const { checkinDate, checkoutDate, guests, totalPrice } = req.body;

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Mock payment processing delay
        // In a real app, you would integrate Stripe here
        
        const reservation = new Reservation({
            user: req.user._id,
            listing: id,
            checkinDate,
            checkoutDate,
            guests,
            totalPrice,
            paymentStatus: 'completed' // Mock successful payment
        });

        await reservation.save();
        res.status(201).json({ message: "Reservation created successfully", reservation });
    } catch (error) {
        console.error("Reservation Error:", error);
        res.status(500).json({ message: "Failed to create reservation", error: error.message });
    }
};

module.exports.getUserReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id })
            .populate('listing')
            .sort({ createdAt: -1 });
        
        res.status(200).json(reservations);
    } catch (error) {
        console.error("Fetch Reservations Error:", error);
        res.status(500).json({ message: "Failed to fetch reservations", error: error.message });
    }
};
