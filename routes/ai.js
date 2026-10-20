const express = require('express');
const { randomBytes, timingSafeEqual } = require('node:crypto');
const { configured, extractStayIntent } = require('../services/geminiStayFinder');
const { createRequestGuard } = require('../services/aiRequestGuard');
function createAIRouter({ enabled = configured, extract = extractStayIntent, guard = createRequestGuard() } = {}) {
  const router=express.Router();
  router.get('/stay-finder', (req,res) => {
    res.set('Cache-Control','no-store');
    if (!req.session.aiCsrf) req.session.aiCsrf=randomBytes(32).toString('hex');
    res.render('listings/stay-finder.ejs',{aiEnabled:enabled(),csrfToken:req.session.aiCsrf,error:null});
  });
  router.post('/stay-finder', async (req,res,next) => {
    res.set('Cache-Control','no-store');
    const render = (status,error) => res.status(status).render('listings/stay-finder.ejs',{aiEnabled:enabled(),csrfToken:req.session.aiCsrf || '',error});
    if (!req.isAuthenticated()) return render(401,'Log in before using AI, or use the normal search filters.');
    const expected=req.session.aiCsrf;
    const received=req.body.csrfToken;
    if (typeof expected !== 'string' || typeof received !== 'string' || Buffer.byteLength(expected) !== Buffer.byteLength(received) || !timingSafeEqual(Buffer.from(expected),Buffer.from(received))) return render(403,'This form expired. Reload the stay finder and try again.');
    if (req.body.consent !== 'yes') return render(400,'Confirm the Google Gemini notice before using AI.');
    if (!enabled()) return render(503,'AI is not configured. The normal filters still work.');
    const release=guard.acquire(String(req.user._id));
    if (!release) { res.set('Retry-After','600');return render(429,'AI is busy or you have reached the request limit. Use the filters or try again in 10 minutes.'); }
    try {
      const filters=await extract(req.body.prompt);
      const params=new URLSearchParams({q:filters.q,ai:'1'});
      for (const key of ['minPrice','maxPrice']) if (filters[key] !== null) params.set(key,filters[key]);
      return res.redirect(303,`/listings?${params}`);
    } catch (error) {
      if ([400,503].includes(error.statusCode)) return render(error.statusCode,error.message);
      return next(error);
    } finally { release(); }
  });
  return router;
}
module.exports = { createAIRouter };
