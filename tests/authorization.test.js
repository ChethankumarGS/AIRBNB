const {test}=require('node:test');const assert=require('node:assert/strict');const Listing=require('../models/listing');const Review=require('../models/review');const {isOwner,isReviewAuthor}=require('../appMiddleware');
const run=(handler,req)=>new Promise(resolve=>handler(req,{},resolve));
test('missing listings produce 404 and query failures reach middleware',async t=>{
 t.mock.method(Listing,'findById',async()=>null);assert.equal((await run(isOwner,{params:{id:'a'},user:{_id:'u'}})).statusCode,404);
 Listing.findById.mock.mockImplementation(async()=>{throw new Error('db down');});assert.equal((await run(isOwner,{params:{id:'a'},user:{_id:'u'}})).message,'db down');
});
test('review deletion requires the right parent listing and author',async t=>{
 t.mock.method(Listing,'findById',async()=>({reviews:[{equals:id=>id==='r'}]}));t.mock.method(Review,'findById',async()=>({_id:'r',author:{equals:id=>id==='u'}}));
 assert.equal(await run(isReviewAuthor,{params:{id:'l',reviewId:'r'},user:{_id:'u'}}),undefined);
 assert.equal((await run(isReviewAuthor,{params:{},user:{_id:'other'}})).statusCode,403);
 Review.findById.mock.mockImplementation(async()=>({_id:'other',author:{equals:()=>true}}));assert.equal((await run(isReviewAuthor,{params:{},user:{_id:'u'}})).statusCode,404);
});
