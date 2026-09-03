/**
 * Dynamic Expo config.
 *
 * app.json stays the static base; Expo passes it in as `config` and this file
 * only injects values that must not live in the repository. The Google Maps
 * Android key is read from the EAS build environment, so the raw key is never
 * committed.
 *
 * The key is not prefixed EXPO_PUBLIC_ on purpose: it is consumed at build time
 * to write AndroidManifest metadata, not read from JS at runtime, so it must not
 * be inlined into the JavaScript bundle.
 *
 * The key still ships inside the APK -- that is unavoidable for Maps SDK and is
 * why the real protection is the package name + SHA-1 restriction on the key
 * itself, not secrecy of the string.
 */
module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  if (!googleMapsApiKey && process.env.EAS_BUILD === "true") {
    // Fail loudly during a build rather than shipping a blank grey map that
    // gives no error at runtime.
    throw new Error(
      "GOOGLE_MAPS_ANDROID_API_KEY is not set for this EAS build. The checkout map " +
        "will not render without it. Set it with: eas env:set --name GOOGLE_MAPS_ANDROID_API_KEY"
    );
  }

  return {
    ...config,
    android: {
      ...config.android,
      // Omitted entirely when unset so local `expo start` still works; only the
      // map is unavailable there.
      ...(googleMapsApiKey
        ? { config: { ...config.android?.config, googleMaps: { apiKey: googleMapsApiKey } } }
        : {}),
    },
  };
};
