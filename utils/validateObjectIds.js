const ExpressError=require('./ExpressError');
function validateObjectIds(...names) {
  return (req,res,next)=> {
    if (names.some(name=> !/^[a-f\d]{24}$/i.test(req.params[name] || ''))) return next(new ExpressError(400,'Invalid listing or review ID.'));
    next();
  };
}
module.exports=validateObjectIds;
