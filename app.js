if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const User = require("./models/user.js");

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const app = express();
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/Wanderlust"; // Local fallback

// ✅ Connect to MongoDB
async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1); // Stop the app if DB connection fails
  }
}
main();

// ✅ View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// ✅ Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ✅ Session Store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET || "fallbacksecretkey" },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.error("❌ ERROR in Mongo Session Store:", err);
});

// ✅ Session Configuration
const sessionOptions = {
  store,
  secret: process.env.SECRET || "fallbacksecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60
