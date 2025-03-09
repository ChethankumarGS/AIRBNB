// app.js

if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/Wanderlust";

// const dbUrl = process.env.ATLASDB_URL;


main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


// const store = MongoStore.create({
//   mongoUrl : dbUrl,
//   crypto :{
//     secret:"mysupersecretcode",
//   },
//   touchAfter : 24 *3600,
// });

// store.on("error", () => {
//   console.log("ERROR in MONGO SESSION STORE", err);
// });

const sessionOptions = {
  //  store,
  secret : "mysupersecretcode",
  resave :false,
  saveUninitialized :true,
  cookie : {
    expires : Date.now() + 7 * 24 * 60 *60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly:true,
  },
};


// app.get("/", (req, res) => {
//   res.send("Hi, I am Cheth");
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser  = req.user;
  next();
});

//       // DEMO USER
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User ({
//     email: "soup@gmail.com",
//     username : "sampath",
//   });

//   let registeredUser = await User.register(fakeUser,"Password@123");
//   res.send(registeredUser);
// });

  app.use("/listings",listingRouter);
  app.use("/listings/:id/reviews", reviewRouter);
  app.use("/",userRouter);
 
   app.all("*",(req,res,next)  => {
    next(new ExpressError(404,"page Not Found!"));
   });


app.use((err, req, res, next) => {
  let {statusCode = 500, message = "Something went wrong!"} = err;
  res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});