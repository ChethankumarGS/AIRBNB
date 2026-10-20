const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createRequestGuard } = require('../services/aiRequestGuard');
test('per-account requests reset after the quota window', () => {
  let time=0; const guard=createRequestGuard({now:()=>time,maxRequests:2,windowMs:10});
  guard.acquire('a')();guard.acquire('a')();assert.equal(guard.acquire('a'),null);
  time=10;assert.equal(typeof guard.acquire('a'),'function');
});
test('global concurrency is capped and release is idempotent', () => {
  const guard=createRequestGuard({maxConcurrent:1});const release=guard.acquire('a');
  assert.equal(guard.acquire('b'),null);release();release();assert.equal(typeof guard.acquire('b'),'function');
});
test('rate-limit state has a hard entry cap', () => {
  const guard=createRequestGuard({maxEntries:1});guard.acquire('a')();assert.equal(guard.acquire('b'),null);
});
