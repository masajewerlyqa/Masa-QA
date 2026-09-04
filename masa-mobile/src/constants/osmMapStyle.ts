import type { StyleSpecification } from '@maplibre/maplibre-react-native';

/**
 * OpenStreetMap raster style shared by every map on mobile (checkout picker,
 * store profile). Inline so no style server, API key or billing account is
 * needed -- same tile source the web app uses via Leaflet.
 */
export const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};
