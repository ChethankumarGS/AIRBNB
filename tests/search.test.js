const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseFilters, buildQuery } = require('../services/listingSearch');
test('search defaults and empty prices', () => {
  assert.deepEqual(parseFilters(), {q:'',minPrice:null,maxPrice:null,sort:'newest',page:1});
  assert.equal(parseFilters({minPrice:'0'}).minPrice, 0);
});
test('destination is literal, not an executable regex', () => {
  assert.equal(buildQuery(parseFilters({q:'Goa.*'})).$or[0].title.$regex, 'Goa\\.\\*');
});
test('prices are bounded, ordered numbers', () => {
  for (const value of ['-1', 'NaN', 'Infinity', {}, '1e3', '10000001', '0.001']) assert.throws(() => parseFilters({maxPrice:value}));
  assert.throws(() => parseFilters({minPrice:'500',maxPrice:'100'}));
  assert.deepEqual(buildQuery(parseFilters({minPrice:'10',maxPrice:'20'})).price, {$gte:10,$lte:20});
});
test('query operators, repeated fields and invalid sort/page are rejected', () => {
  for (const input of [{q:{$ne:''}}, {q:['Goa','Paris']}, {sort:'__proto__'}, {page:'1.5'}, {page:0}, {page:{}}]) assert.throws(() => parseFilters(input));
});
