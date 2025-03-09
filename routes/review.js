const express = require("express");
const router = express.Router({mergeParams: true });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync");
const validateReview = require("../utils/validateReview.js");
const { isLoggedIn,isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

// Create Reviews
router.post(
  "/",
  validateReview,
  wrapAsync(reviewController.createReview));

// Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  wrapAsync(reviewController.destroyReview));

module.exports = router;