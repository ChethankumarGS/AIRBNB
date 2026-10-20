const {test}=require('node:test');const assert=require('node:assert/strict');const validate=require('../utils/validateObjectIds');
test('bad IDs fail as 400 rather than database cast errors',()=>{let error;validate('id')({params:{id:'not-an-id'}},{},e=>error=e);assert.equal(error.statusCode,400);});
test('valid IDs pass and all named params are checked',()=>{let error;validate('id','reviewId')({params:{id:'a'.repeat(24),reviewId:'b'.repeat(24)}},{},e=>error=e);assert.equal(error,undefined);});
