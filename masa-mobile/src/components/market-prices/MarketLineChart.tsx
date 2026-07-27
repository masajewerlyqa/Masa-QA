import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { theme } from '../../constants/theme';
import type { PricePoint } from '../../types/marketPrices';

const CHART_HEIGHT = 320;
const CHART_WIDTH = 340;
const PAD = 8;

type MarketLineChartProps = {
  data: PricePoint[];
};

export function MarketLineChart({ data }: MarketLineChartProps): React.JSX.Element {
  const points = useMemo(() => {
    if (!data.length) return '';
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const innerW = CHART_WIDTH - PAD * 2;
    const innerH = CHART_HEIGHT - PAD * 2;
    return data
      .map((d, i) => {
        const x = PAD + (i / Math.max(data.length - 1, 1)) * innerW;
        const y = PAD + innerH - ((d.value - min) / range) * innerH;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data]);

  const lastPoint = useMemo(() => {
    if (!data.length) return null;
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const innerW = CHART_WIDTH - PAD * 2;
    const innerH = CHART_HEIGHT - PAD * 2;
    const i = data.length - 1;
    const x = PAD + (i / Math.max(data.length - 1, 1)) * innerW;
    const y = PAD + innerH - ((data[i].value - min) / range) * innerH;
    return { x, y };
  }, [data]);

  return (
    <View style={styles.wrap}>
      <Svg height={CHART_HEIGHT} width="100%" viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Line
            key={i}
            stroke="rgba(83, 28, 36, 0.08)"
            strokeDasharray="3 3"
            x1={PAD}
            x2={CHART_WIDTH - PAD}
            y1={PAD + ((CHART_HEIGHT - PAD * 2) / 4) * i}
            y2={PAD + ((CHART_HEIGHT - PAD * 2) / 4) * i}
          />
        ))}
        {points ? (
          <Polyline
            fill="none"
            points={points}
            stroke={theme.colors.primary}
            strokeWidth={2}
          />
        ) : null}
        {lastPoint && data.length <= 32 ? (
          <Circle cx={lastPoint.x} cy={lastPoint.y} fill={theme.colors.primary} r={4} stroke="#fff" strokeWidth={1} />
        ) : null}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: CHART_HEIGHT,
    width: '100%',
  },
});
