const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, isReviewAuthor } = require("../appMiddleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!["image/jpeg", "image/png"].includes(file.mimetype)) return callback(new (require("../utils/ExpressError"))(400, "Upload a JPG or PNG image."));
    callback(null, true);
  }
});
router.param("id", (req, res, next) => require("../utils/validateObjectIds")("id")(req, res, next));
router
  .route("/")
  .get(wrapAsync(listingController.index))
   .post
   (isLoggedIn,
     upload.single("listing[image]"),
     wrapAsync(listingController.createListing));
  


// NEW ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(isLoggedIn, isOwner, upload.single("listing[image]"),
   wrapAsync(listingController.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Editing the listings


router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
