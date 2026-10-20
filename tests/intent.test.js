const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validatePrompt, validateIntent } = require('../services/stayIntent');
test('trip descriptions are short and non-empty', () => {
  assert.equal(validatePrompt('  Goa under 2000  '), 'Goa under 2000');
  for (const input of ['', 'hi', 'a'.repeat(501), {}, ['a stay in Goa']]) assert.throws(() => validatePrompt(input));
});
test('obvious phone numbers and emails are not sent to AI', () => {
  for (const input of ['Goa email me at a@example.com', 'Contact +91 99999 88888 please']) assert.throws(() => validatePrompt(input));
  assert.equal(validatePrompt('Goa under 2000 per night'), 'Goa under 2000 per night');
});
test('only destination and numeric nightly prices become filters', () => {
  assert.equal(validateIntent({destination:'Goa',minPrice:null,maxPrice:2000}).maxPrice, 2000);
  for (const input of [null, [], {destination:{$ne:''},minPrice:null,maxPrice:2000}, {destination:'Goa',minPrice:null,maxPrice:'2000'}, {destination:'Goa',minPrice:null,maxPrice:2000,book:true}, {destination:'Goa'}]) assert.throws(() => validateIntent(input));
});
