import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import * as Location from 'expo-location';

import { theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';

/** Doha. Only ever the initial camera position -- never a selected location. */
const INITIAL_REGION: Region = {
  latitude: 25.2854,
  longitude: 51.531,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export type DeliveryCoords = { latitude: number; longitude: number };

/**
 * Delivery pin picker.
 *
 * The map centres on Doha for convenience, but that is a camera position, not a
 * choice: `onChange` only fires when the customer actually places a pin. The
 * previous implementation set a fixed Doha coordinate automatically, so every
 * order shipped the same wrong location while the UI claimed a location was set.
 *
 * Permission is optional. It is only used to offer "use my location"; the map
 * and manual pin dropping work fully when it is denied.
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
  const [locating, setLocating] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);

  useEffect(() => {
    if (value) {
      setRegion((r) => ({ ...r, latitude: value.latitude, longitude: value.longitude }));
    }
  }, [value]);

  const useCurrentLocation = useCallback(async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Denial is not an error: the customer can still drop a pin manually.
        setPermissionDenied(true);
        return;
      }
      setPermissionDenied(false);
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setRegion((r) => ({ ...r, ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }));
      onChange(coords);
    } catch {
      setPermissionDenied(true);
    } finally {
      setLocating(false);
    }
  }, [onChange]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapBox}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          initialRegion={INITIAL_REGION}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={(e) => onChange(e.nativeEvent.coordinate)}
        >
          {value ? (
            <Marker
              coordinate={value}
              draggable
              onDragEnd={(e) => onChange(e.nativeEvent.coordinate)}
            />
          ) : null}
        </MapView>
      </View>

      <Text style={[textStyle(isArabic, 'caption'), styles.hint]}>
        {value
          ? isArabic
            ? 'اسحب الدبوس لضبط موقع التوصيل بدقة.'
            : 'Drag the pin to fine-tune your delivery location.'
          : isArabic
            ? 'اضغط على الخريطة لتحديد موقع التوصيل.'
            : 'Tap the map to set your delivery location.'}
      </Text>

      <Pressable onPress={() => void useCurrentLocation()} disabled={locating} style={styles.locateBtn}>
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
  // Explicit height: a MapView with no height collapses to zero and renders blank.
  // Matches the web checkout map's 300px so the picker isn't cramped on mobile.
  mapBox: {
    borderColor: theme.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 300,
    overflow: 'hidden',
    width: '100%',
  },
  wrapper: { marginTop: 12 },
});
