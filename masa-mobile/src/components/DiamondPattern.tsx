import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import { StyleSheet, View } from 'react-native';

/** Matches web `DiamondPattern` footer background. */
export function DiamondPattern(): React.JSX.Element {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%">
        <Defs>
          <Pattern height={80} id="diamond-pattern" patternUnits="userSpaceOnUse" width={80}>
            <Path
              d="M40 0 L60 20 L40 40 L20 20 Z"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth={0.5}
            />
          </Pattern>
        </Defs>
        <Rect fill="url(#diamond-pattern)" height="100%" width="100%" />
      </Svg>
    </View>
  );
}
