const express = require("express");
const router = express.Router({mergeParams: true });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync");
const validateReview = require("../utils/validateReview.js");
const { isLoggedIn,isReviewAuthor } = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");

router.use(require("../utils/validateObjectIds")("id"));
router.use("/:reviewId", require("../utils/validateObjectIds")("reviewId"));

// Create Reviews
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview));

// Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview));

module.exports = router;