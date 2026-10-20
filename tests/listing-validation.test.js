const { test }=require('node:test');const assert=require('node:assert/strict');const {cleanListing}=require('../utils/validateListing');
const listing={title:' Stay ',description:'Nice stay',location:'Goa',country:'India',price:'1000'};
test('listing updates whitelist editable fields',()=>{assert.deepEqual(cleanListing({...listing,owner:'attacker',reviews:[],geometry:{}}),{title:'Stay',description:'Nice stay',location:'Goa',country:'India',price:1000});});
test('malformed listings and invalid prices fail before database writes',()=>{
 for (const input of [null,{}, {...listing,price:-1},{...listing,price:'Infinity'},{...listing,title:{$ne:''}},{...listing,description:'a'.repeat(2001)}]) assert.throws(()=>cleanListing(input));
});
