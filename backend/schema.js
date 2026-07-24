const Joi = require("joi");


//for New Listing

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
        ownerName: Joi.string().allow('', null),
        contactEmail: Joi.string().email({ tlds: { allow: false } }).allow('', null),
        contactPhone: Joi.string().allow('', null),
        propertyType: Joi.string().allow('', null),
        guests: Joi.number().integer().min(0).optional(),
        beds: Joi.number().integer().min(0).optional(),
        baths: Joi.number().integer().min(0).optional(),
        amenities: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()).optional(),
        coverImage: Joi.string().allow('', null),
        coverImageIndex: Joi.string().optional(),
    }).unknown(true).required(),
});

//for reviews

module.exports.reviewSchema = Joi.object({
    review:Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    })

});