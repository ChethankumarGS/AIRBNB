const { test } = require('node:test');
const assert = require('node:assert/strict');
const wrapAsync = require('../utils/wrapAsync');
test('async request errors reach Express error middleware', async () => {
  const error = new Error('example failure');
  await new Promise((resolve) => {
    wrapAsync(async () => { throw error; })({}, {}, (caught) => {
      assert.equal(caught, error);
      resolve();
    });
  });
});
