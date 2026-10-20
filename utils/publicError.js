function publicError(error, production = process.env.NODE_ENV === 'production') {
  let status = Number(error.statusCode || error.status);
  if (!Number.isInteger(status) || status < 400 || status > 599) status=500;
  if (error.name==='MulterError') return {status:400,message:'Upload one JPG or PNG image, up to 5 MB.'};
  if (error.name==='ValidationError' || error.name==='CastError') return {status:400,message:'Some details are invalid. Check your form and try again.'};
  if (status===413) return {status:413,message:'That request is too large. Use a shorter description.'};
  return {status,message:production && status>=500 ? 'Something went wrong. Please try again.' : (error.message || 'Something went wrong.')};
}
module.exports=publicError;
