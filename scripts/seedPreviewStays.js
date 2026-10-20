// Seed demo stays for the preview deployment.
// Images are hotlinked from Unsplash CDN (free to use under the Unsplash
// License; same pattern as init/data.js). Run with:
//   ATLASDB_URL="mongodb+srv://..." node scripts/seedPreviewStays.js
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const IMG = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=60`;

// Images for the four stays already in the preview DB, matched by city in the title.
const EXISTING_IMAGES = [
  { match: /goa/i, url: IMG("1552733407-5d5c46c3bb3b") },
  { match: /manali/i, url: IMG("1587381420270-3e1a5b9e6904") },
  { match: /jaipur/i, url: IMG("1630986431773-170e9215b8b3") },
  { match: /alleppey/i, url: IMG("1717069541470-9b1a2b085e1f") },
];

const STAYS = [
  { title: "Coffee Estate Bungalow, Coorg", location: "Madikeri", country: "India", price: 2800, lat: 12.4244, lon: 75.7390, img: "1518684079-3c830dcef090", description: "A quiet bungalow on a working coffee estate, with garden views and estate walks at the edge of Madikeri." },
  { title: "Hill View Homestay, Chikmagalur", location: "Chikmagalur", country: "India", price: 2200, lat: 13.3161, lon: 75.7740, img: "1464822759023-fed622ff2c3b", description: "A family-run homestay looking over the Mullayanagiri range, with home-style meals and cool evening breezes." },
  { title: "Plantation Glamping Dome, Sakleshpur", location: "Sakleshpur", country: "India", price: 3000, lat: 12.9711, lon: 75.7839, img: "1521401830884-6c03c1c87ebb", description: "A glamping dome set inside a coffee and pepper plantation, with a private deck and plantation trails." },
  { title: "Riverside Wildlife Lodge, Kabini", location: "Kabini", country: "India", price: 6500, lat: 11.8730, lon: 76.3500, img: "1493246507139-91e8fad9978e", description: "A riverside lodge near the Nagarhole forest, with safari bookings on request and sunset views over the backwaters." },
  { title: "Hillside Wooden Chalet, Nandi Hills", location: "Nandi Hills", country: "India", price: 3800, lat: 13.3702, lon: 77.6835, img: "1618140052121-39fc6db33972", description: "A wooden chalet on the slopes above the vineyards, a short drive from the Nandi Hills sunrise viewpoint." },
  { title: "Heritage Pool Home, Mysuru", location: "Mysuru", country: "India", price: 4500, lat: 12.2958, lon: 76.6394, img: "1566073771259-6a8506099945", description: "A restored family home with a courtyard pool, ten minutes from the palace and the old market." },
  { title: "Boulder Hills Camp, Hampi", location: "Hampi", country: "India", price: 1500, lat: 15.3350, lon: 76.4600, img: "1480796927426-f609979314bd", description: "A tented camp among the boulder hills, with the Tungabhadra river and the ruins a short ride away." },
  { title: "White Town Beach Villa, Puducherry", location: "Puducherry", country: "India", price: 5200, lat: 11.9335, lon: 79.8083, img: "1571003123894-1f0594d2b5d9", description: "A breezy villa near White Town, with the promenade and the French quarter's cafes within walking distance." },
  { title: "Lakeside Cottage, Ooty", location: "Ooty", country: "India", price: 2600, lat: 11.4102, lon: 76.6950, img: "1578645510447-e20b4311e3ce", description: "A small cottage by the lake, with a jetty view, tea garden walks and the toy train station nearby." },
  { title: "Rainforest Pool Resort, Wayanad", location: "Wayanad", country: "India", price: 4800, lat: 11.6854, lon: 76.1320, img: "1520250497591-112f2f40a3f4", description: "A resort tucked into the rainforest edge, with a pool under the palms and waterfalls a short trek away." },
  { title: "Lake View Haveli, Udaipur", location: "Udaipur", country: "India", price: 5500, lat: 24.5854, lon: 73.7125, img: "1571896349842-33c89424de2d", description: "A lake-facing haveli stay with a rooftop over Lake Pichola, close to the City Palace and the old city ghats." },
  { title: "Lake View Cottage, Nainital", location: "Nainital", country: "India", price: 3200, lat: 29.3803, lon: 79.4635, img: "1501785888041-af3ef285b470", description: "A hill cottage above the lake, with boating below and mall road a short walk away." },
  { title: "Desert Night Camp, Jaisalmer", location: "Jaisalmer", country: "India", price: 4000, lat: 26.9157, lon: 70.9083, img: "1758705023495-b64dfe01f970", description: "A tented desert camp on the Sam dunes, with folk music at dinner and a clear view of the night sky." },
  { title: "Riverside Valley Retreat, Rishikesh", location: "Rishikesh", country: "India", price: 2400, lat: 30.0869, lon: 78.2676, img: "1476514525535-07fb3b4ae5f1", description: "A quiet retreat above the Ganges valley, close to the rafting points and the evening aarti at Triveni Ghat." },
  { title: "Snowline Forest Cabin, Shimla", location: "Shimla", country: "India", price: 3400, lat: 31.1048, lon: 77.1734, img: "1470165301023-58dab8118cc9", description: "A cedar-forest cabin on the ridge beyond town, with snow views in winter and mall road a short drive away." },
  { title: "Tea Estate Bungalow, Darjeeling", location: "Darjeeling", country: "India", price: 3600, lat: 27.0410, lon: 88.2627, img: "1764012393710-be2d33971ac0", description: "A planter's bungalow on a working tea estate, with Kanchenjunga views on clear mornings." },
  { title: "Rocky Cliff Beach Stay, Varkala", location: "Varkala", country: "India", price: 3000, lat: 8.7379, lon: 76.7060, img: "1585543805890-6051f7829f98", description: "A beach stay by the red cliffs, with the north cliff cafes and the papanasam beach steps away." },
  { title: "White Sand Beach Villa, Havelock Island", location: "Havelock Island", country: "India", price: 7500, lat: 11.9760, lon: 92.9665, img: "1622396481328-9b1b78cdd9fd", description: "A villa behind Radhanagar's white sand, with dive shops and the jetty a short scooter ride away." },
  { title: "Skyline Studio Apartment, Bengaluru", location: "Bengaluru", country: "India", price: 2500, lat: 12.9716, lon: 77.5946, img: "1719416177005-f85fae63ac15", description: "A high-rise studio near MG Road, with city views, fast wifi and the metro a few minutes away." },
  { title: "Modern Pool Villa, Lonavala", location: "Lonavala", country: "India", price: 6000, lat: 18.7546, lon: 73.4062, img: "1586375300773-8384e3e4916f", description: "A modern villa with a private pool, set among the Sahyadri hills between Mumbai and Pune." },
];

async function main() {
  if (!process.env.ATLASDB_URL) throw new Error("ATLASDB_URL is required");
  await mongoose.connect(process.env.ATLASDB_URL);
  const owner = (await User.findOne({ username: "preview" })) || (await User.findOne());
  if (!owner) throw new Error("No user found to own the demo listings");
  console.log("owner:", owner.username);

  for (const { match, url } of EXISTING_IMAGES) {
    const res = await Listing.updateOne({ title: match }, { $set: { "image.url": url, "image.filename": "unsplash" } });
    console.log("update", match, "matched:", res.matchedCount, "modified:", res.modifiedCount);
  }

  let inserted = 0, updated = 0;
  for (const s of STAYS) {
    const doc = {
      title: s.title,
      description: s.description,
      image: { url: IMG(s.img), filename: "unsplash" },
      price: s.price,
      location: s.location,
      country: s.country,
      owner: owner._id,
      geometry: { type: "Point", coordinates: [s.lon, s.lat] },
    };
    const res = await Listing.updateOne({ title: s.title }, { $set: doc }, { upsert: true, runValidators: true });
    if (res.upsertedCount) inserted++; else if (res.modifiedCount) updated++;
  }
  console.log("inserted:", inserted, "updated:", updated);
  console.log("total listings:", await Listing.countDocuments());
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err.message); process.exit(1); });
