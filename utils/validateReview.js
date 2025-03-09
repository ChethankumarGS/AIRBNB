// utils/validateReview.js
module.exports = (req, res, next) => {
    const { rating, comment } = req.body.review;
  
    if (!rating || !comment) {
      req.flash("error", "Rating and comment are required!");
      return res.redirect(`/listings/${req.params.id}`);
    }
  
    next(); // Proceed to the next middleware or route handler
  };