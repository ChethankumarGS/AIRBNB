# Wanderlust

Wanderlust is an Airbnb-style stay-listing platform. Browse places to stay, post your own listing with photos, see it on a map, and leave reviews.

**Live demo:** https://wanderlust-tan-ten.vercel.app/listings

**AI stay finder:** https://wanderlust-tan-ten.vercel.app/ai/stay-finder

## Features

- **Browse listings** - a card grid of stays with photo, title and price per night.
- **Destination and budget search** - search stay names, cities and countries; filter nightly INR prices, sort and page through results. Prices exclude taxes and do not establish a booking total.
- **AI stay finder** - optional Gemini-powered trip description to destination/budget filters, with editable results from the real listing database.
- **Listing details** - description, location, country, owner and reviews on one page.
- **Add, edit and delete listings** - logged-in users can create a listing and upload a photo. Only the owner of a listing can edit or delete it.
- **Photo uploads** - images are uploaded to Cloudinary through Multer.
- **Maps** - the location you enter is geocoded with Mapbox, and the listing page shows it on an interactive map with a marker.
- **Reviews and ratings** - logged-in users can leave a 1-5 star rating and a comment. Only the author can delete their own review, and deleting a listing removes its reviews.
- **Accounts** - sign up, log in and log out with Passport (username and password). Sessions are stored in MongoDB.
- **Feedback messages** - flash messages for success and error states, plus a custom error page.

AI does not verify dates, guest capacity, amenities or booking availability. Category icons that did not have backend support have been removed.

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
npm ci
```

Copy `.env.example` to `.env` and use your own values; never commit this file.

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
npm start
```

Then open http://localhost:8080/listings.

## Optional AI setup

Set these only on the server:

```env
AI_ENABLED=true
GEMINI_API_KEY=your_key_from_google_ai_studio
GEMINI_MODEL=your_generateContent_compatible_model
```

AI is disabled unless all three are configured. Choose a model available in your own Google project; there is no hardcoded model that might disappear later. The key never reaches browser code or a request URL. Use a secret manager or your hosting provider's environment settings, not a committed file.

Open `/ai/stay-finder`, log in, enter a short request such as "Goa under INR 3000 per night", and agree to the Gemini notice. Check the resulting destination and prices before choosing a listing. Input is capped at 500 characters. Obvious email addresses and phone numbers are blocked, but detection is not complete. Do not include private information. The app does not save prompt text; Google receives it and free-tier terms may allow product improvement use.

Five attempts per account per ten minutes and four concurrent provider calls per app process. Limits reset on restart and are not shared across replicas; use a shared rate-limit store before scaling. Provider calls time out after ten seconds and are not automatically retried. AI failure never prevents manual searching.

## Tests and checks

```bash
npm test
npm audit
```

The Node test suite uses mocks and local HTTP fixtures. It needs no database, Google key, Cloudinary account or Mapbox token. It covers filter validation, price bounds, literal regex search, AI output validation, provider failures, consent/login/CSRF guards, request limits, authorization, rendering, sessions and injection regressions. GitHub Actions runs the tests on Node 22.

Live database writes, real image uploads, real Gemini output and the production deployment still require a separate smoke test with owner-approved credentials. A local browser pass uses mock listings and Gemini, not production data.

## Deployment and security notes

- Production requires `SECRET` with at least 32 characters, HTTPS and the expected single reverse proxy (the app trusts one proxy in production). Rotate the secret to invalidate existing sessions when needed.
- The previously tracked `.env` is no longer tracked, but removing it does not erase repository history. **Rotate all credentials ever committed there.** Never restore them from history.
- Compatible security fixes reduced the initial audit from 19 findings (including 2 critical) to 2 high findings in Cloudinary and its storage adapter. Resolving those remaining findings requires a tested major-version migration. This branch does not claim a clean audit.
- The AI form has CSRF protection. Older listing/review/account forms do not yet have full CSRF-token coverage; same-site session cookies are defense in depth, not a replacement.
- Uploads are limited to one JPG/PNG, 5 MB, checked by declared MIME type. Byte-level image validation is not implemented. A failed geocode/database write after upload can leave an unused Cloudinary image; cleanup is not yet transactional.
- There is no payment or booking flow. Displayed prices and listing-owner location data are not availability guarantees.

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
