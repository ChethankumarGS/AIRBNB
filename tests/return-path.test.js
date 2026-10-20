const {test}=require('node:test');const assert=require('node:assert/strict');const path=require('../utils/returnPath');
test('post-login redirects stay on this site',()=>{assert.equal(path('/listings/123?x=1'),'/listings/123?x=1');for(const value of ['https://evil.example','//evil.example','/\\evil.example','/\r\nheader',null])assert.equal(path(value),'/listings');});
