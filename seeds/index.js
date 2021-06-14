const mongoose = require('mongoose');
const cities = require('./cities');
const seedHelpers = require('./seedHelpers');
const Campground = require('./../models/campground');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error!"));
db.once("open", () => {
    console.log("Database connected");
});
async function seedDB() {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        let randomPrice = Math.floor(Math.random() * 400) + 100;
        let random1000 = Math.floor(Math.random() * 1000);
        let descriptorsIndex = Math.floor(Math.random() * seedHelpers.descriptors.length);
        let placesIndex = Math.floor(Math.random() * seedHelpers.places.length);
        const camp = new Campground({
            author: '60be20ea426ba9588cef2819',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${seedHelpers.descriptors[descriptorsIndex]} ${seedHelpers.places[placesIndex]}`,
            price: randomPrice,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude,
                cities[random1000].latitude]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dvgn5jd9w/image/upload/v1623529730/YelpCamp/mqs3dvwx8ensovrpgppy.jpg',
                    filename: 'YelpCamp/iet9ynxefdfg6m7dx40k'
                }
            ],
            description: 'A campsite or camping pitch is a place used for overnight stay in an outdoor area. In UK English, a campsite is an area, usually divided into a number of pitches, where people can camp overnight using tents.'
        });
        await camp.save();
        console.log(camp);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
    console.log("Database closed");
})
// async function size() {
//     console.log((await Campground.find()).length);
// }
// size()
