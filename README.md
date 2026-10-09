# Wanderlust

Wanderlust is an Airbnb-style stay-listing platform. Browse places to stay, post your own listing with photos, see it on a map, and leave reviews.

**Live demo:** https://wanderlust-s9l5.onrender.com/listings

> The demo runs on a free Render instance, so the first load after a quiet period can take a minute while it wakes up.

## Features

- **Browse listings** - a card grid of stays with photo, title and price per night.
- **Price with or without tax** - a toggle on the listings page shows the total after 18% GST.
- **Listing details** - description, location, country, owner and reviews on one page.
- **Add, edit and delete listings** - logged-in users can create a listing and upload a photo. Only the owner of a listing can edit or delete it.
- **Photo uploads** - images are uploaded to Cloudinary through Multer.
- **Maps** - the location you enter is geocoded with Mapbox, and the listing page shows it on an interactive map with a marker.
- **Reviews and ratings** - logged-in users can leave a 1-5 star rating and a comment. Only the author can delete their own review, and deleting a listing removes its reviews.
- **Accounts** - sign up, log in and log out with Passport (username and password). Sessions are stored in MongoDB.
- **Feedback messages** - flash messages for success and error states, plus a custom error page.

The search box and the category icons (Trending, Rooms, Beach and so on) are in the UI but are not wired to the backend yet.

## Tech stack

- Node.js, Express
- MongoDB with Mongoose (MongoDB Atlas)
- EJS with ejs-mate layouts, Bootstrap
- Passport (passport-local, passport-local-mongoose), express-session, connect-mongo, connect-flash
- Cloudinary and Multer for image uploads
- Mapbox SDK and Mapbox GL JS for geocoding and maps

## Run it locally

You need Node.js 22 and a MongoDB database (a free Atlas cluster works), plus free Cloudinary and Mapbox accounts.

```bash
git clone https://github.com/ChethankumarGS/AIRBNB.git
cd AIRBNB
npm install
```

Create a `.env` file in the project root. Use your own values; never commit this file.

```env
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
MAP_TOKEN=your_mapbox_public_token
ATLASDB_URL=your_mongodb_connection_string
SECRET=a_long_random_session_secret
```

Start the app:

```bash
node app.js
```

Then open http://localhost:8080/listings.

## Project structure

```
controllers/   request handlers (listings, reviews, users)
models/        Mongoose schemas (Listing, Review, User)
routes/        Express routers
views/         EJS templates
public/        CSS, client-side JS, images
middleware.js  login, owner and review-author checks
cloudConfig.js Cloudinary storage setup
app.js         app entry point
```

## Author

Chethan Kumar - [GitHub](https://github.com/ChethankumarGS)
