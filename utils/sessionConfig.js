module.exports = (env=process.env) => {
  if (env.NODE_ENV==='production' && (!env.SECRET || env.SECRET.length<32)) throw new Error('Production requires a session SECRET of at least 32 characters.');
  return {
    secret:env.SECRET || require('node:crypto').randomBytes(32).toString('hex'),
    resave:false,saveUninitialized:false,
    cookie:{maxAge:7*24*60*60*1000,httpOnly:true,sameSite:'lax',secure:env.NODE_ENV==='production'}
  };
};
