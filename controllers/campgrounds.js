const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const title = "All Campgrounds"
    let i = 0;
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds, title, i })
}
module.exports.renderNewForm = (req, res) => {
    const title = "New Campground"
    res.render('campgrounds/new', { title });
}
module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    newCampground.author = req.user._id;
    await newCampground.save();
    console.log(newCampground);
    req.flash('success', 'Successfully made a new Campground!');
    res.redirect(`/campgrounds/${newCampground._id}`);
}
module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find the campground!');
        res.redirect('/campgrounds')
    }
    const title = campground.title;
    res.render('campgrounds/show', { campground, title });
}
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find the campground!');
        res.redirect('/campgrounds')
    }
    const title = campground.title;
    res.render('campgrounds/edit', { campground, title });
}
module.exports.updateCampground = async (req, res) => {
    // console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
    let images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...images);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated the campground!')
    res.redirect(`/campgrounds/${req.params.id}`);
}
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById({ _id: id })
    if (campground.images) {
        for (let img of campground.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }
    await Campground.findByIdAndDelete({ _id: id })
    req.flash('success', 'Successfully deleted the campground!')
    res.redirect('/campgrounds')
}