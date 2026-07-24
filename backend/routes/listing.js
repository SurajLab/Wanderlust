const express = require("express");
const router = express.Router();
const wrapAsync = require("../public/utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingControllers = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
  .get(wrapAsync(listingControllers.index))
  .post(isLoggedIn, upload.array('images', 10), validateListing, wrapAsync(listingControllers.createListing));

router.route("/:id")
  .get(wrapAsync(listingControllers.showListing))
  .put(isLoggedIn, isOwner, upload.array('images', 10), validateListing, wrapAsync(listingControllers.updateListing))
  .delete(isLoggedIn, isOwner, wrapAsync(listingControllers.destroyListing));

module.exports = router;
