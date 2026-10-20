const ExpressError=require('./ExpressError');
async function geocodeListing(client,details) {
  const response=await client.forwardGeocode({query:`${details.location}, ${details.country}`,limit:1}).send();
  const geometry=response.body?.features?.[0]?.geometry;
  if (geometry?.type!=='Point' || !Array.isArray(geometry.coordinates) || geometry.coordinates.length!==2 || !geometry.coordinates.every(Number.isFinite) || Math.abs(geometry.coordinates[0])>180 || Math.abs(geometry.coordinates[1])>90) throw new ExpressError(400,'We could not find that location. Check the city and country.');
  return geometry;
}
module.exports=geocodeListing;
