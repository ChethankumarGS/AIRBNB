const {test}=require('node:test');const assert=require('node:assert/strict');const express=require('express');const path=require('node:path');
delete process.env.MAP_TOKEN;
const Listing=require('../models/listing');const controller=require('../controllers/listings');
test('destination, price, sorting and pagination reach the database safely',async t=>{
 let query,sort,skip,limit;
 t.mock.method(Listing,'countDocuments',async value=>{query=value;return 30;});
 t.mock.method(Listing,'find',()=>({sort(value){sort=value;return this;},skip(value){skip=value;return this;},limit(value){limit=value;return Promise.resolve([]);}}));
 let locals;await controller.index({query:{q:'Goa.*',maxPrice:'2000',sort:'price-asc',page:'2'}},{render:(view,value)=>locals=value});
 assert.equal(query.$or[0].title.$regex,'Goa\\.\\*');assert.deepEqual(query.price,{$lte:2000});assert.deepEqual(sort,{price:1,_id:1});assert.equal(skip,12);assert.equal(limit,12);assert.equal(locals.total,30);assert.equal(locals.pageCount,3);assert.match(locals.pageUrl(3),/maxPrice=2000/);
});
test('new-listing page is not mistaken for an invalid object ID',async t=>{
 const app=express();app.use((req,res,next)=>{req.isAuthenticated=()=>false;req.session={};req.flash=()=>{};next();});app.use('/listings',require('../routes/listing'));
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
 const response=await fetch(`http://127.0.0.1:${server.address().port}/listings/new`,{redirect:'manual'});assert.equal(response.status,302);assert.equal(response.headers.get('location'),'/login');
});
test('index view escapes hostile query text and handles empty pages',async()=>{
 const html=await require('ejs').renderFile(path.join(__dirname,'../views/listings/index.ejs'),{layout:()=>{},allListings:[],filters:{q:'<script>alert(1)</script>',minPrice:null,maxPrice:null,sort:'newest',page:1},aiSearch:false,total:0,pageCount:1,pageUrl:()=>''});assert.ok(!html.includes('<script>alert'));assert.match(html,/No stays match/);
});
