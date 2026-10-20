const { MAX_PRICE, SearchError }=require('../services/listingSearch');
function cleanListing(input) {
  if (!input || typeof input!=='object' || Array.isArray(input)) throw new SearchError('Listing details are required.');
  const clean={};
  for (const [key,max] of [['title',120],['description',2000],['location',120],['country',120]]) {
    if (typeof input[key]!=='string' || !input[key].trim() || input[key].trim().length>max) throw new SearchError(`Check the listing ${key}.`);
    clean[key]=input[key].trim();
  }
  if (!['string','number'].includes(typeof input.price) || !/^\d+(\.\d{1,2})?$/.test(String(input.price))) throw new SearchError('Enter a valid nightly price.');
  clean.price=Number(input.price);
  if (!Number.isFinite(clean.price) || clean.price>MAX_PRICE) throw new SearchError('Enter a valid nightly price.');
  return clean; // Owner, reviews, geometry and image are always server-managed.
}
module.exports={cleanListing};
