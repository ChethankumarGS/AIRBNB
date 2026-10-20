const Listing = require("../models/listing");
const { cleanListing } = require("../utils/validateListing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const { parseFilters, buildQuery, SORTS, PAGE_SIZE } = require("../services/listingSearch");
module.exports.index = async (req, res) => {
  const filters = parseFilters(req.query);
  const query = buildQuery(filters);
  const total = await Listing.countDocuments(query);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  filters.page = Math.min(filters.page, pageCount);
  const allListings = await Listing.find(query).sort(SORTS[filters.sort])
    .skip((filters.page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
  const pageUrl = (page) => {
    const params = new URLSearchParams({ q: filters.q, sort: filters.sort, page: String(page) });
    for (const key of ["minPrice", "maxPrice"]) if (filters[key] !== null) params.set(key, filters[key]);
    return `/listings?${params}`;
  };
  res.render("listings/index.ejs", { allListings, filters, total, pageCount, pageUrl, aiSearch: req.query.ai === "1" });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you Requested does not Exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  const details = cleanListing(req.body.listing);
  if (!req.file) throw new (require("../utils/ExpressError"))(400, "Upload a listing image.");
  let response = await geocodingClient
    .forwardGeocode({
      query: `${details.location}, ${details.country}`,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(details);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  newListing.geometry = response.body.features[0].geometry;

   let savedListing = await newListing.save();

  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you Requested does not Exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res, next) => {
  const { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { $set: cleanListing(req.body.listing) }, { new: true, runValidators: true });

  if (!listing) throw new (require("../utils/ExpressError"))(404, "Listing not found.");

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", " Listing Deleted!");
  res.redirect("/listings");
};
