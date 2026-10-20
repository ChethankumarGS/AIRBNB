const Listing = require("./models/listing");
const Review = require("./models/review");

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in to create listing!");
         return res.redirect("/login");
      }
      next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

const ExpressError = require("./utils/ExpressError");
const wrapAsync = require("./utils/wrapAsync");
module.exports.isOwner = wrapAsync(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return next(new ExpressError(404, "Listing not found."));
  if (!listing.owner || !listing.owner.equals(req.user._id)) return next(new ExpressError(403, "You are not the owner of this listing."));
  next();
});
module.exports.isReviewAuthor = wrapAsync(async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);
  const review = await Review.findById(req.params.reviewId);
  if (!listing || !review || !listing.reviews.some(id => id.equals(review._id))) return next(new ExpressError(404, "Review not found on this listing."));
  if (!review.author || !review.author.equals(req.user._id)) return next(new ExpressError(403, "You are not the author of this review."));
  next();
});
