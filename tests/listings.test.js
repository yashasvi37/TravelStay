const request = require("supertest");
const app = require("../app");
const User = require("../models/user");
const Listing = require("../models/listing");
const Review = require("../models/review");

describe("Listing & Review Routes", () => {
  let user1, user2;
  let token1, token2;
  let listingId, reviewId;
  let csrfToken1, csrfToken2;

  beforeEach(async () => {
    // 1. Create two mock users
    user1 = await User.register(new User({ email: "user1@example.com", username: "user1" }), "pass1");
    user2 = await User.register(new User({ email: "user2@example.com", username: "user2" }), "pass2");

    // 2. Login to get tokens and CSRF tokens
    const res1 = await request(app).post("/login").send({ username: "user1", password: "pass1" });
    token1 = res1.headers["set-cookie"].find(c => c.startsWith("token=")).split(";")[0];
    
    const csrfRes1 = await request(app).get("/csrf-token").set("Cookie", token1);
    csrfToken1 = csrfRes1.body.csrfToken;

    const res2 = await request(app).post("/login").send({ username: "user2", password: "pass2" });
    token2 = res2.headers["set-cookie"].find(c => c.startsWith("token=")).split(";")[0];
    
    const csrfRes2 = await request(app).get("/csrf-token").set("Cookie", token2);
    csrfToken2 = csrfRes2.body.csrfToken;

    // 3. Create a listing owned by user1
    const listing = new Listing({
      title: "Test Listing",
      description: "Test Description",
      price: 100,
      country: "Test Country",
      location: "Test Location",
      owner: user1._id
    });
    await listing.save();
    listingId = listing._id.toString();

    // 4. Create a review authored by user2 on user1's listing
    const review = new Review({
      comment: "Great place!",
      rating: 5,
      author: user2._id
    });
    await review.save();
    reviewId = review._id.toString();

    listing.reviews.push(review);
    await listing.save();
  });

  describe("DELETE /listings/:id", () => {
    it("should allow the owner to delete their listing and cascade delete reviews", async () => {
      const res = await request(app)
        .delete(`/listings/${listingId}`)
        .set("Cookie", token1)
        .set("csrf-token", csrfToken1);

      expect(res.statusCode).toBe(200);

      // Verify listing is deleted
      const foundListing = await Listing.findById(listingId);
      expect(foundListing).toBeNull();

      // Verify cascade deletion of reviews
      const foundReview = await Review.findById(reviewId);
      expect(foundReview).toBeNull();
    });

    it("should return 403 when a non-owner tries to delete the listing", async () => {
      const res = await request(app)
        .delete(`/listings/${listingId}`)
        .set("Cookie", token2)
        .set("csrf-token", csrfToken2);

      expect(res.statusCode).toBe(403);
    });

    it("should return 401 for unauthenticated user", async () => {
      const res = await request(app)
        .delete(`/listings/${listingId}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe("DELETE /listings/:id/reviews/:rid", () => {
    it("should allow the review author to delete their review", async () => {
      const res = await request(app)
        .delete(`/listings/${listingId}/reviews/${reviewId}`)
        .set("Cookie", token2)
        .set("csrf-token", csrfToken2);

      expect(res.statusCode).toBe(200);

      const foundReview = await Review.findById(reviewId);
      expect(foundReview).toBeNull();
    });

    it("should return 403 when a non-author tries to delete the review", async () => {
      const res = await request(app)
        .delete(`/listings/${listingId}/reviews/${reviewId}`)
        .set("Cookie", token1)
        .set("csrf-token", csrfToken1);

      expect(res.statusCode).toBe(403);
    });
  });
});
