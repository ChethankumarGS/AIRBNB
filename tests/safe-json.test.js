const {test}=require('node:test');const assert=require('node:assert/strict');const safeJson=require('../utils/safeJson');
test('map data cannot break out of its script element',()=>{const value={title:'</script><script>alert(1)</script>&\u2028'};const output=safeJson(value);assert.ok(!output.includes('<'));assert.ok(!output.includes('&'));assert.deepEqual(JSON.parse(output),value);});
