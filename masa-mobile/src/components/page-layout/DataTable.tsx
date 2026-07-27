import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';

export type TableRow = string[];

type DataTableProps = {
  headers: string[];
  rows: TableRow[];
  isArabic: boolean;
};

export function DataTable({ headers, rows, isArabic }: DataTableProps): React.JSX.Element {
  const colWidth = 88;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.table}>
        <View style={styles.headRow}>
          {headers.map((h) => (
            <Text key={h} style={[styles.headCell, { width: colWidth }, textStyle(isArabic, 'bodySm')]}>
              {h}
            </Text>
          ))}
        </View>
        {rows.map((row, ri) => (
          <View key={ri} style={[styles.row, ri === rows.length - 1 && styles.rowLast]}>
            {row.map((cell, ci) => (
              <Text
                key={`${ri}-${ci}`}
                style={[styles.cell, { width: colWidth }, textStyle(isArabic, 'body')]}
              >
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    borderColor: theme.colors.border,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: theme.colors.white,
  },
  table: {
    minWidth: '100%',
  },
  headRow: {
    backgroundColor: 'rgba(247, 243, 238, 0.8)',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  headCell: {
    color: theme.colors.masaDark,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  row: {
    borderBottomColor: 'rgba(83, 28, 36, 0.05)',
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
