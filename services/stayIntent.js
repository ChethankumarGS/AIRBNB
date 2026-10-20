const { parseFilters, SearchError } = require('./listingSearch');
function validatePrompt(value) {
  if (typeof value !== 'string' || value.trim().length < 8 || value.trim().length > 500) throw new SearchError('Describe your stay in 8 to 500 characters.');
  const prompt = value.trim();
  // A precaution, not a guarantee that all personal information can be detected.
  if (/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(prompt) || /(?:\+?\d[\s().-]*){10,}/.test(prompt)) throw new SearchError('Remove phone numbers and email addresses before using AI.');
  return prompt;
}
function validateIntent(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new SearchError('AI could not read that request. Use the filters instead.');
  const allowed = ['destination', 'minPrice', 'maxPrice'];
  if (Object.keys(value).some(key => !allowed.includes(key)) || allowed.some(key => !Object.hasOwn(value,key))) throw new SearchError('AI returned unsupported filters. Use the filters instead.');
  if (typeof value.destination !== 'string' || [value.minPrice,value.maxPrice].some(p => p !== null && typeof p !== 'number')) throw new SearchError('AI returned invalid filters. Use the filters instead.');
  return parseFilters({q:value.destination,minPrice:value.minPrice,maxPrice:value.maxPrice});
}
module.exports = { validatePrompt, validateIntent };
