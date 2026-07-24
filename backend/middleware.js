const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./public/utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "You must be logged in first!" });
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(req.user._id)) {
    return res.status(403).json({ error: "You are not the owner of this listing" });
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  // Wrap flat body into listing object for Joi validation
  const toValidate = { listing: req.body };
  let { error } = listingSchema.validate(toValidate);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    return res.status(400).json({ error: errMsg });
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const toValidate = { review: req.body };
  let { error } = reviewSchema.validate(toValidate);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(", ");
    return res.status(400).json({ error: errMsg });
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    return res.status(403).json({ error: "You are not the author of this review" });
  }
  next();
};
