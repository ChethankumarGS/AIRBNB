const MAX_PRICE = 10000000;
const PAGE_SIZE = 12;
const SORTS = { newest: { _id: -1 }, 'price-asc': { price: 1, _id: 1 }, 'price-desc': { price: -1, _id: 1 } };
class SearchError extends Error {
  constructor(message) { super(message); this.statusCode = 400; }
}
function text(value, name, max = 100) {
  if (value === undefined || value === '') return '';
  if (typeof value !== 'string' || value.trim().length > max) throw new SearchError(`Check ${name}.`);
  return value.trim();
}
function price(value, name) {
  if (value === undefined || value === '' || value === null) return null;
  if (!['string', 'number'].includes(typeof value) || !/^\d+(\.\d{1,2})?$/.test(String(value))) throw new SearchError(`Check ${name}.`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed > MAX_PRICE) throw new SearchError(`Check ${name}.`);
  return parsed;
}
function parseFilters(input = {}) {
  const filters = { q: text(input.q, 'destination'), minPrice: price(input.minPrice, 'minimum price'), maxPrice: price(input.maxPrice, 'maximum price'), sort: text(input.sort, 'sort') || 'newest' };
  if (!Object.hasOwn(SORTS, filters.sort)) throw new SearchError('Choose a supported sort order.');
  if (filters.minPrice !== null && filters.maxPrice !== null && filters.minPrice > filters.maxPrice) throw new SearchError('Minimum price must not exceed maximum price.');
  const page = input.page === undefined ? '1' : String(input.page);
  if (!/^\d+$/.test(page) || Number(page) < 1 || Number(page) > 10000) throw new SearchError('Check the page number.');
  filters.page = Number(page);
  return filters;
}
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function buildQuery(filters) {
  const query = {};
  if (filters.q) query.$or = ['title', 'location', 'country'].map(field => ({ [field]: { $regex: escapeRegex(filters.q), $options: 'i' } }));
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    query.price = {};
    if (filters.minPrice !== null) query.price.$gte = filters.minPrice;
    if (filters.maxPrice !== null) query.price.$lte = filters.maxPrice;
  }
  return query;
}
module.exports = { parseFilters, buildQuery, SORTS, PAGE_SIZE, MAX_PRICE, SearchError };
