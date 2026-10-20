const {test}=require('node:test');const assert=require('node:assert/strict');const validate=require('../utils/validateReview');
test('review validation rejects malformed payloads and forged authors',()=>{
 for(const review of [undefined,{}, {rating:0,comment:'ok'},{rating:6,comment:'ok'},{rating:'2.5',comment:'ok'},{rating:5,comment:' '},{rating:5,comment:'x'.repeat(2001)}]) {let error;validate({body:{review}},{},e=>error=e);assert.equal(error.statusCode,400);}
 const req={body:{review:{rating:'5',comment:' Nice ',author:'forged'}}};validate(req,{},()=>{});assert.deepEqual(req.body.review,{rating:5,comment:'Nice'});
});
