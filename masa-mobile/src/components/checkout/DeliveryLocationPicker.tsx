import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Camera,
  Map,
  Marker,
  UserLocation,
  type CameraRef,
  type LngLat,
  type StyleSpecification,
} from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';

import { theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';

/**
 * OpenStreetMap raster style, declared inline so the map needs no style server,
 * no API key and no billing account.
 *
 * This is the same tile source the web checkout map already uses via Leaflet
 * (`components/map/QatarLocationPicker.tsx`), so both clients now render
 * identical cartography.
 *
 * OSM's tile usage policy expects light, attributed use. If MASA's traffic
 * grows, swap `tiles` for a self-hosted or commercial OSM-compatible endpoint --
 * that is a one-line change here and needs no other code edits.
 */
const OSM_STYLE: StyleSpecification = {
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

/** Doha. Only ever the initial camera position -- never a selected location. */
const DOHA: LngLat = [51.531, 25.2854];
const INITIAL_ZOOM = 10;
/** Zoom used once we have a real point (street level, matches web's zoom 14). */
const SELECTED_ZOOM = 14;

export type DeliveryCoords = { latitude: number; longitude: number };

/**
 * Delivery pin picker (MapLibre + OpenStreetMap).
 *
 * The map centres on the customer's GPS position when permission is granted,
 * otherwise on Doha, but centring is only a camera move: `onChange` fires only
 * when the customer actually picks a point, either by tapping the map or by
 * pressing "use my location". An earlier implementation set a fixed Doha
 * coordinate automatically, so every order shipped the same wrong location
 * while the UI claimed a location was set.
 *
 * Permission is optional throughout -- the map, panning and tap-to-select all
 * work when it is denied.
 */
export function DeliveryLocationPicker({
  value,
  onChange,
  isArabic,
}: {
  value: DeliveryCoords | null;
  onChange: (coords: DeliveryCoords) => void;
  isArabic: boolean;
}): React.JSX.Element {
  const cameraRef = useRef<CameraRef>(null);
  const [locating, setLocating] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  /** Drives <UserLocation>; shown only once permission is actually granted. */
  const [showUserDot, setShowUserDot] = useState(false);
  /** Guards the one-shot auto-centre so it never fights later user panning. */
  const didAutoCentre = useRef(false);
  /**
   * Set when *this* component caused the change (map tap, or the locate button,
   * which moves the camera itself). Without it the restore effect below would
   * re-run on every selection and yank the camera back to SELECTED_ZOOM --
   * zooming the customer back out to 14 mid-way through fine-tuning at 17.
   */
  const skipRestoreRecentre = useRef(false);

  const moveCamera = useCallback((lngLat: LngLat, zoom: number) => {
    cameraRef.current?.easeTo({ center: lngLat, zoom, duration: 600 });
  }, []);

  /**
   * Automatic location on open: centre the map on the customer if they already
   * granted permission, or if they grant it now. Deliberately does NOT call
   * `onChange` -- centring the camera is not the customer choosing a delivery
   * address, and submitting a GPS reading they never confirmed would reintroduce
   * the "silent wrong coordinates" bug.
   */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;

        if (status !== 'granted') {
          // Not an error: manual selection still works.
          setShowUserDot(false);
          return;
        }
        setShowUserDot(true);

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled || didAutoCentre.current) return;

        // If the form already carries a pin (e.g. returning to the step), that
        // selection wins over the device position.
        if (!value) {
          didAutoCentre.current = true;
          moveCamera([pos.coords.longitude, pos.coords.latitude], SELECTED_ZOOM);
        }
      } catch {
        if (!cancelled) setShowUserDot(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally runs once: this is the "on open" behaviour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Keep the camera on an externally-restored pin (e.g. the form already had
   * coordinates when this mounted). Selections made here are skipped: the map
   * is already showing the point the customer just touched, and re-centring
   * would fight their own zoom level.
   */
  useEffect(() => {
    if (!value) return;
    didAutoCentre.current = true;
    if (skipRestoreRecentre.current) {
      skipRestoreRecentre.current = false;
      return;
    }
    moveCamera([value.longitude, value.latitude], SELECTED_ZOOM);
  }, [value, moveCamera]);

  const useCurrentLocation = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setShowUserDot(false);
        return;
      }
      setPermissionDenied(false);
      setShowUserDot(true);

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      didAutoCentre.current = true;
      // This already moves the camera, so the restore effect must not re-run it.
      skipRestoreRecentre.current = true;
      moveCamera([coords.longitude, coords.latitude], SELECTED_ZOOM);
      // Pressing this button IS an explicit choice, so it does select.
      onChange(coords);
    } catch {
      setPermissionDenied(true);
    } finally {
      setLocating(false);
    }
  }, [onChange, moveCamera]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapBox}>
        <Map
          attributionPosition={{ bottom: 8, right: 8 }}
          logo={false}
          mapStyle={OSM_STYLE}
          // MapLibre reports [lng, lat]; the form stores {latitude, longitude}.
          onPress={(e) => {
            const [longitude, latitude] = e.nativeEvent.lngLat;
            didAutoCentre.current = true;
            // The map is already where the customer tapped -- don't re-centre.
            skipRestoreRecentre.current = true;
            onChange({ latitude, longitude });
          }}
          style={StyleSheet.absoluteFill}
        >
          <Camera
            ref={cameraRef}
            initialViewState={{
              center: value ? [value.longitude, value.latitude] : DOHA,
              zoom: value ? SELECTED_ZOOM : INITIAL_ZOOM,
            }}
          />

          {showUserDot ? <UserLocation /> : null}

          {value ? (
            <Marker anchor="bottom" lngLat={[value.longitude, value.latitude]}>
              <View style={styles.pin}>
                <View style={styles.pinHead} />
                <View style={styles.pinTail} />
              </View>
            </Marker>
          ) : null}
        </Map>
      </View>

      <Text style={[textStyle(isArabic, 'caption'), styles.hint]}>
        {value
          ? isArabic
            ? 'اضغط في مكان آخر على الخريطة لتعديل موقع التوصيل.'
            : 'Tap elsewhere on the map to adjust your delivery location.'
          : isArabic
            ? 'اضغط على الخريطة لتحديد موقع التوصيل.'
            : 'Tap the map to set your delivery location.'}
      </Text>

      {/* Selected coordinates are shown back so the choice is verifiable. */}
      {value ? (
        <Text style={[textStyle(isArabic, 'caption'), styles.coords]}>
          {`${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`}
        </Text>
      ) : null}

      <Pressable
        disabled={locating}
        onPress={() => void useCurrentLocation()}
        style={styles.locateBtn}
      >
        {locating ? (
          <ActivityIndicator color={theme.colors.primary} size="small" />
        ) : (
          <Text style={styles.locateText}>
            {isArabic ? 'استخدام موقعي الحالي' : 'Use my current location'}
          </Text>
        )}
      </Pressable>

      {permissionDenied ? (
        <Text style={[textStyle(isArabic, 'caption'), styles.denied]}>
          {isArabic
            ? 'تم رفض إذن الموقع. يمكنك تحديد الموقع يدوياً على الخريطة.'
            : 'Location permission denied. You can still set the pin manually on the map.'}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  coords: { color: theme.colors.masaDark, fontWeight: '600', marginTop: 4 },
  denied: { color: theme.colors.masaGray, marginTop: 6 },
  hint: { marginTop: 8 },
  locateBtn: {
    alignItems: 'center',
    borderColor: theme.colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    paddingVertical: 10,
  },
  locateText: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
  // Explicit height: a map with no height collapses to zero and renders blank.
  // Matches the web checkout map's 300px.
  mapBox: {
    borderColor: theme.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 300,
    overflow: 'hidden',
    width: '100%',
  },
  // Simple MASA-coloured pin, drawn in RN so no marker image asset is needed.
  pin: { alignItems: 'center' },
  pinHead: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 3,
    height: 24,
    width: 24,
  },
  pinTail: {
    backgroundColor: theme.colors.primary,
    height: 10,
    marginTop: -3,
    width: 3,
  },
  wrapper: { marginTop: 12 },
});
