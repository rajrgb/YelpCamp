const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } }; //It is passed as second argument in new shcema to make the virutal property become actual property 
//when campground object converted to JSON.

campgroundSchema = new Schema({
    title: String,
    description: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    location: String,
    images: [{ url: String, filename: String }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts) //here opts is passed as second argument before making a model with it.

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

campgroundSchema.post('findOneAndDelete', async (doc) => {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
})
module.exports = mongoose.model('Campground', campgroundSchema);