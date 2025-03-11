// Load environment variables in development mode
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Import dependencies
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
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");

// Import routers
const listingRouter = require("./routes/listing");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

const app = express();

// Database connection
const dbUrl = process.env.ATLASDB_URL || "mongodb://localhost:27017/mydatabase";

async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to DB");
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1); // Exit if database connection fails
  }
}
main();

// Set up EJS as view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// Session Store Configuration
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: { secret: process.env.SECRET || "fallback_secret" },
  touchAfter: 24 * 3600, // Update session every 24 hours
});

store.on("error", (err) => {
  console.log("❌ ERROR in MONGO SESSION STORE:", err);
});

// Session Configuration
const sessionOptions = {
  store,
  secret: process.env.SECRET || "fallback_secret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Authentication Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Middleware (for success/error messages)
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Route handlers
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 404 Error Handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { err });
});

// Start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
