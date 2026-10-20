const ExpressError=require('./ExpressError');
module.exports = (req,res,next) => {
  const input=req.body.review;
  if (!input || typeof input!=='object' || Array.isArray(input) || !['string','number'].includes(typeof input.rating) || !/^[1-5]$/.test(String(input.rating)) || typeof input.comment!=='string' || !input.comment.trim() || input.comment.trim().length>2000) return next(new ExpressError(400,'Add a rating from 1 to 5 and a comment of up to 2000 characters.'));
  req.body.review={rating:Number(input.rating),comment:input.comment.trim()};
  next();
};
