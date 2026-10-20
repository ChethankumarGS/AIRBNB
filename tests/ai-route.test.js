const { test } = require('node:test');
const assert = require('node:assert/strict');
const express=require('express');
const path=require('node:path');
const { createAIRouter }=require('../routes/ai');
async function fixture(t,{authenticated=true,enabled=()=>true,extract=async()=>({q:'Goa',minPrice:null,maxPrice:2000}),guard}={}) {
  const app=express();app.set('view engine','ejs');app.set('views',path.join(__dirname,'../views'));
  app.use(express.urlencoded({extended:false}));
  app.use((req,res,next)=>{req.session={aiCsrf:'a'.repeat(64)};req.isAuthenticated=()=>authenticated;req.user={_id:'test-user'};res.locals={currUser:authenticated?req.user:null,success:[],error:[]};next();});
  // Test the real EJS body without a database or layout dependencies.
  app.locals.layout=()=>{};
  app.use('/ai',createAIRouter({enabled,extract,guard}));
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  return async (data,method='POST')=>fetch(`http://127.0.0.1:${server.address().port}/ai/stay-finder`,{method,redirect:'manual',...(method==='POST'?{headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(data)}:{})});
}
const data={prompt:'Goa under 2000',consent:'yes',csrfToken:'a'.repeat(64)};
test('successful AI request redirects to editable real-listing filters without prompt',async t=>{
  const request=await fixture(t);const response=await request(data);
  assert.equal(response.status,303);assert.equal(response.headers.get('location'),'/listings?q=Goa&ai=1&maxPrice=2000');assert.equal(response.headers.get('cache-control'),'no-store');
});
test('unauthenticated, missing consent and invalid CSRF never call Gemini',async t=>{
  let calls=0;const extract=async()=>{calls++;};
  let request=await fixture(t,{authenticated:false,extract});assert.equal((await request(data)).status,401);
  request=await fixture(t,{extract});assert.equal((await request({...data,csrfToken:'wrong'})).status,403);assert.equal((await request({...data,consent:'no'})).status,400);assert.equal(calls,0);
});
test('disabled AI and quota exhaustion return useful fallback pages',async t=>{
  let request=await fixture(t,{enabled:()=>false});assert.equal((await request(data)).status,503);
  request=await fixture(t,{guard:{acquire:()=>null}});const response=await request(data);assert.equal(response.status,429);assert.equal(response.headers.get('retry-after'),'600');
});
test('provider failure releases concurrency slot and does not echo prompt',async t=>{
  let released=0;const request=await fixture(t,{guard:{acquire:()=>()=>released++},extract:async()=>{const e=new Error('AI is unavailable right now.');e.statusCode=503;throw e;}});
  const response=await request(data);assert.equal(response.status,503);assert.equal(released,1);assert.ok(!(await response.text()).includes(data.prompt));
});
test('AI page stays useful without a configured provider',async t=>{
  const request=await fixture(t,{enabled:()=>false});const response=await request({},'GET');assert.equal(response.status,200);assert.match(await response.text(),/AI is not set up yet/);
});
