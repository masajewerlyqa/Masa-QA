import { StyleSheet, View } from 'react-native';
import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';

import { OSM_STYLE } from '../../constants/osmMapStyle';
import { theme } from '../../constants/theme';

/**
 * Read-only pin on the store's saved location. Mirrors web
 * `components/store/StoreLocationMapSection.tsx` -> `components/map/StoreLocationMap.tsx`,
 * minus interactivity (nothing to select here -- the seller sets this from
 * their own store settings, not the buyer viewing the profile).
 */
export function StoreLocationMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): React.JSX.Element {
  return (
    <View style={styles.mapBox}>
      <Map attributionPosition={{ bottom: 4, right: 4 }} logo={false} mapStyle={OSM_STYLE} style={StyleSheet.absoluteFill}>
        <Camera center={[longitude, latitude]} zoom={14} />
        <Marker anchor="bottom" lngLat={[longitude, latitude]}>
          <View style={styles.pin}>
            <View style={styles.pinHead} />
            <View style={styles.pinTail} />
          </View>
        </Marker>
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  mapBox: {
    borderColor: theme.colors.border,
    borderRadius: 10,
    borderWidth: 1,
    height: 200,
    overflow: 'hidden',
    width: '100%',
  },
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
});
