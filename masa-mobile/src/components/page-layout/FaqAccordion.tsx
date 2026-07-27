import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MOBILE_CONTENT_PADDING_X } from '../../constants/layout';
import { fontFamily, theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';

export type FaqItem = { question: string; answer: string };

type FaqAccordionProps = {
  items: FaqItem[];
  isArabic: boolean;
};

export function FaqAccordion({ items, isArabic }: FaqAccordionProps): React.JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <View style={styles.list}>
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <View key={item.question} style={styles.item}>
            <Pressable
              onPress={() => setOpenIndex(open ? null : index)}
              style={({ pressed }) => [styles.summary, pressed && styles.summaryPressed]}
            >
              <Text style={[styles.question, textStyle(isArabic, 'bodySm')]}>{item.question}</Text>
              <View style={styles.toggle}>
                <Text style={styles.toggleText}>{open ? '−' : '+'}</Text>
              </View>
            </Pressable>
            {open ? (
              <View style={styles.answerWrap}>
                <Text style={textStyle(isArabic, 'body')}>{item.answer}</Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    maxWidth: 672,
    paddingHorizontal: MOBILE_CONTENT_PADDING_X,
    width: '100%',
    alignSelf: 'center',
  },
  item: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.border,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  summary: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  summaryPressed: {
    backgroundColor: 'rgba(247, 243, 238, 0.5)',
  },
  question: {
    color: theme.colors.masaDark,
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
  toggle: {
    alignItems: 'center',
    borderColor: 'rgba(83, 28, 36, 0.2)',
    borderRadius: 999,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  toggleText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  answerWrap: {
    borderTopColor: 'rgba(83, 28, 36, 0.05)',
    borderTopWidth: 1,
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 0,
  },
});
