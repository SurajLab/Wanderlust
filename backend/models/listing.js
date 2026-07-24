const { ref } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  ownerName: {
    type: String,
  },
  contactEmail: {
    type: String,
  },
  contactPhone: {
    type: String,
  },
  propertyType: {
    type: String,
  },
  guests: {
    type: Number,
  },
  beds: {
    type: Number,
  },
  baths: {
    type: Number,
  },
  amenities: [String],
  image: {
    url:String,
    filename:String,
  },
  images: [
    {
      url: String,
      filename: String,
    }
  ],
  coverImage: {
    url: String,
    filename: String,
  },

  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: "reviews",
  }],
  owner:{
    type: Schema.Types.ObjectId,
    ref:"User",
  },

  geometry:{
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
    }
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  };
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;