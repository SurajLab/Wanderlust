const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.json({ listings: allListings });
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  res.json({ listing });
};

module.exports.createListing = async (req, res) => {
  const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });
  
  if (typeof req.body.amenities === 'string') {
    req.body.amenities = req.body.amenities.split(',').map(item => item.trim()).filter(Boolean);
  }

  let response = await geocodingClient.forwardGeocode({
    query: req.body.location,
    limit: 1,
  }).send();

  const newListing = new Listing(req.body);
  newListing.owner = req.user._id;

  if (req.files && req.files.length > 0) {
    newListing.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    const coverIndex = req.body.coverImageIndex ? parseInt(req.body.coverImageIndex, 10) : 0;
    newListing.coverImage = newListing.images[!Number.isNaN(coverIndex) && newListing.images[coverIndex] ? coverIndex : 0];
  }

  newListing.geometry = response.body.features[0].geometry;
  await newListing.save();
  res.status(201).json({ message: "New Listing created", listing: newListing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  if (typeof req.body.amenities === 'string') {
    req.body.amenities = req.body.amenities.split(',').map(item => item.trim()).filter(Boolean);
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const locationChanged = req.body.location && req.body.location !== listing.location;
  if (locationChanged) {
    const geocodingClient = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });
    let response = await geocodingClient.forwardGeocode({
      query: req.body.location,
      limit: 1,
    }).send();
    listing.geometry = response.body.features[0].geometry;
  }

  listing.set(req.body);

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(file => ({ url: file.path, filename: file.filename }));
    listing.images.push(...newImages);
    if (req.body.coverImageIndex) {
      const coverIndex = parseInt(req.body.coverImageIndex, 10);
      if (!Number.isNaN(coverIndex) && newImages[coverIndex]) {
        listing.coverImage = newImages[coverIndex];
      }
    }
  }

  if (req.body.coverImage) {
    const selectedCover = listing.images.find(img => img.filename === req.body.coverImage || img.url === req.body.coverImage);
    if (selectedCover) {
      listing.coverImage = selectedCover;
    }
  }

  if (!listing.coverImage && listing.images.length > 0) {
    listing.coverImage = listing.images[0];
  }

  await listing.save();
  res.json({ message: "Listing Updated!", listing });
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  res.json({ message: "Listing Deleted!" });
};