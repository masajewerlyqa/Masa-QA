import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { theme } from '../../constants/theme';

type ProductSkeletonProps = {
  variant?: 'grid' | 'list';
};

function ProductSkeletonBase({ variant = 'grid' }: ProductSkeletonProps): React.JSX.Element {
  return (
    <View style={[styles.card, variant === 'list' ? styles.listCard : null]}>
      <View style={[styles.image, variant === 'list' ? styles.listImage : null]} />
      <View style={styles.body}>
        <View style={styles.lineShort} />
        <View style={styles.lineTitle} />
        <View style={styles.linePrice} />
      </View>
    </View>
  );
}

export const ProductSkeleton = memo(ProductSkeletonBase);

export function ProductSkeletonGrid({
  count = 6,
}: {
  count?: number;
}): React.JSX.Element {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.gridItem}>
          <ProductSkeleton />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 16,
  },
  gridItem: {
    width: '48.5%',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  listCard: {
    flexDirection: 'row',
  },
  image: {
    aspectRatio: 1,
    backgroundColor: theme.colors.masaLight,
  },
  listImage: {
    aspectRatio: undefined,
    height: 120,
    width: 120,
  },
  body: {
    gap: 8,
    padding: 12,
  },
  lineShort: {
    backgroundColor: theme.colors.masaLight,
    borderRadius: 4,
    height: 10,
    width: '40%',
  },
  lineTitle: {
    backgroundColor: theme.colors.masaLight,
    borderRadius: 4,
    height: 14,
    width: '85%',
  },
  linePrice: {
    backgroundColor: theme.colors.masaLight,
    borderRadius: 4,
    height: 12,
    width: '50%',
  },
});
