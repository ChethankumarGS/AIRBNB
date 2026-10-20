const {test}=require('node:test');const assert=require('node:assert/strict');const config=require('../utils/sessionConfig');
test('production refuses a default or weak session secret',()=>{assert.throws(()=>config({NODE_ENV:'production'}));assert.throws(()=>config({NODE_ENV:'production',SECRET:'short'}));});
test('production cookies are secure, HTTP-only and same-site',()=>{const result=config({NODE_ENV:'production',SECRET:'a'.repeat(32)});assert.equal(result.cookie.secure,true);assert.equal(result.cookie.sameSite,'lax');assert.equal(result.cookie.httpOnly,true);assert.equal(result.saveUninitialized,false);});
test('development has no hardcoded fallback secret',()=>{assert.notEqual(config({}).secret,config({}).secret);assert.equal(config({}).cookie.secure,false);});
