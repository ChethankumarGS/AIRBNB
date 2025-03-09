// Ensure mapToken and listing are defined
if (!mapToken) {
    console.error("Mapbox access token is missing.");
  }
  
  if (!listing || !listing.geometry || !listing.geometry.coordinates) {
    console.error("Listing data or coordinates are missing.");
  } else {
    // Initialize the map
    mapboxgl.accessToken = mapToken;
  
    const map = new mapboxgl.Map({
      container: 'map', // Container ID
      style: 'mapbox://styles/mapbox/streets-v11', // Map style
      center: listing.geometry.coordinates, // Initial map center [lng, lat]
      zoom: 12 // Initial zoom level
    });
  
    // Add a marker
    const marker = new mapboxgl.Marker({ color: "red" })
      .setLngLat(listing.geometry.coordinates) // Marker position
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // Add popup
          .setHTML(
            `<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`
          )
      )
      .addTo(map);
  
    // Add navigation controls to the map
    map.addControl(new mapboxgl.NavigationControl());
  }