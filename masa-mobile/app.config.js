/**
 * Dynamic Expo config.
 *
 * app.json stays the static base; Expo passes it in as `config` and this file
 * only injects values that must not live in the repository.
 *
 * The checkout map runs on MapLibre + OpenStreetMap raster tiles, which need no
 * API key, no key restrictions and no billing account, so there is nothing
 * map-related left to inject here. The previous Google Maps Android key plumbing
 * (and its EAS build-time guard) was removed with that migration.
 */
module.exports = ({ config }) => config;
