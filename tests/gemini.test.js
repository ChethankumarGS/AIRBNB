const { test } = require('node:test');
const assert = require('node:assert/strict');
const { configured, extractStayIntent } = require('../services/geminiStayFinder');
const env = {AI_ENABLED:'true',GEMINI_API_KEY:'test-not-a-real-key',GEMINI_MODEL:'gemini-test'};
const reply = value => ({ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(value)}]}}]})});
test('AI stays off until explicitly configured', () => {
  assert.equal(configured({}),false);
  assert.equal(configured({...env,AI_ENABLED:'false'}),false);
  assert.equal(configured({...env,GEMINI_MODEL:'../../other'}),false);
  assert.equal(configured(env),true);
});
test('server-side Gemini request uses structured output and no key in URL', async () => {
  const filters = await extractStayIntent('Goa under 2000 per night',{env,fetchImpl:async(url,options)=>{
    assert.ok(!url.includes(env.GEMINI_API_KEY));
    assert.equal(options.headers['x-goog-api-key'],env.GEMINI_API_KEY);
    assert.ok(options.signal);
    const body=JSON.parse(options.body);
    assert.equal(body.generationConfig.responseMimeType,'application/json');
    assert.equal(body.contents[0].parts[0].text,'Goa under 2000 per night');
    return reply({destination:'Goa',minPrice:null,maxPrice:2000});
  }});
  assert.equal(filters.q,'Goa');
});
test('provider errors, blocked answers and malformed output fail closed', async () => {
  for (const response of [{ok:false},{ok:true,json:async()=>({})},reply({destination:'Goa',maxPrice:-1,minPrice:null}),{ok:true,json:async()=>({candidates:[{finishReason:'MAX_TOKENS'}]})}]) {
    await assert.rejects(extractStayIntent('Goa under 2000',{env,fetchImpl:async()=>response}),/AI is unavailable/);
  }
  await assert.rejects(extractStayIntent('Goa under 2000',{env,fetchImpl:async()=>{throw new Error('private provider details');}}),error=>!error.message.includes('private'));
});
test('disabled AI and private input never call the provider', async () => {
  let calls=0; const fetchImpl=async()=>{calls++;};
  await assert.rejects(extractStayIntent('Goa under 2000',{env:{},fetchImpl}));
  await assert.rejects(extractStayIntent('Goa a@example.com',{env,fetchImpl}));
  assert.equal(calls,0);
});
