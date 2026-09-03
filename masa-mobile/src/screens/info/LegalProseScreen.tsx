import { StyleSheet, Text, View } from 'react-native';

import { MarketingPageScroll } from '../../components/page-layout/MarketingPageScroll';
import { PageHero } from '../../components/page-layout/PageHero';
import { ProseBand } from '../../components/page-layout/ProseBand';
import { ProseSection } from '../../components/page-layout/ProseSection';
import type { LegalPageCopy } from '../../constants/pageContent/legal';
import { theme } from '../../constants/theme';
import { textStyle } from '../../constants/typography';
import { useSettings } from '../../context/SettingsContext';

type LegalProseScreenProps = {
  content: { en: LegalPageCopy; ar: LegalPageCopy };
};

export function LegalProseScreen({ content }: LegalProseScreenProps): React.JSX.Element {
  const { language, isArabic } = useSettings();
  const page = content[language];

  return (
    <MarketingPageScroll>
      <PageHero
        eyebrow={page.eyebrow}
        isArabic={isArabic}
        paddingY={80}
        subtitle={page.intro}
        title={page.title}
      />
      <ProseBand>
        {page.sections.map((section) => (
          <ProseSection
            key={section.title}
            isArabic={isArabic}
            paragraphs={section.paragraphs}
            title={section.title}
          />
        ))}
        {page.footerNote ? (
          <Text style={[textStyle(isArabic, 'body'), styles.footer]}>{page.footerNote}</Text>
        ) : null}
      </ProseBand>
    </MarketingPageScroll>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
});
