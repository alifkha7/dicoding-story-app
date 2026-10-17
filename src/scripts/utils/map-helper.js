import L from 'leaflet';

export function createMultiTileMap(containerId, { center = [-2.548926, 118.0148634], zoom = 5 } = {}) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return null;

  // 1. OpenStreetMap Standard
  const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });

  // 2. OpenTopoMap (Topographic)
  const openTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)',
  });

  // 3. Esri World Imagery (Satellite)
  const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 18,
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  });

  const map = L.map(container, {
    center,
    zoom,
    layers: [osmStandard], // Default active base layer
  });

  const baseMaps = {
    'OpenStreetMap (Standar)': osmStandard,
    'OpenTopoMap (Topografi)': openTopo,
    'Esri Satelit (Citra Satelit)': esriSatellite,
  };

  L.control.layers(baseMaps).addTo(map);

  return {
    map,
    baseMaps,
  };
}
