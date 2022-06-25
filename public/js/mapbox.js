export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZnV1dWR5LWxpZmUiLCJhIjoiY2w0YXM5MGExMGZrNjNrcWd2OHN4MXJqcSJ9.Xuomspiw5LHGfov2tPODDw';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/fuuudy-life/cl4b19hde000g15ljs023tzk3',
    scrollZoom: false
    // center: [-118.113491, 34.111745],
    // zoom: 4
  });
  
  const bounds = new mapboxgl.LngLatBounds();
  
  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    // markerはcssですでに定義してある
    el.className = 'marker';
  
    // Add marker
    new mapboxgl.Marker({
      element: el,
      // anchor: 'bottom'はどういう意味かというと、エレメントの底、つまりこの場合はそのピンの底で、正確なGPSの位置になるわけです。
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
  
    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
  
    // Extend map bounds to include current location(ロケーションを含む境界線まで地図を伸ばしてる)
    bounds.extend(loc.coordinates);
  });
  
  // fitBounds を使用すると、ピクセルサイズに関係なく、マップの指定領域をビューに表示します。
  // 移動とズームを実行する関数であるfitBounds
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
}

