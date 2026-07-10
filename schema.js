const Joi=require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required().trim().min(1),
        description: Joi.string().allow("", null).trim(),
        price: Joi.number().required().min(0),
        country: Joi.string().required().trim().min(1),
        location: Joi.string().required().trim().min(1),
        image: Joi.string().optional()
    }).required()
});


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required().trim().min(1)
    }).required()
});