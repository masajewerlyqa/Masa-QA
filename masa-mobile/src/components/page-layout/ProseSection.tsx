import { StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';

type ProseSectionProps = {
  title: string;
  paragraphs: string[];
  isArabic: boolean;
};

export function ProseSection({ title, paragraphs, isArabic }: ProseSectionProps): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={[styles.heading, { fontFamily: fontFamily(isArabic, 'luxury') }]}>{title}</Text>
      {paragraphs.map((p) => (
        <Text key={p.slice(0, 24)} style={textStyle(isArabic, 'body')}>
          {p}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: theme.spacing.md,
  },
  heading: {
    color: theme.colors.primary,
    fontSize: 24,
    lineHeight: 32,
    marginBottom: theme.spacing.xs,
  },
});
