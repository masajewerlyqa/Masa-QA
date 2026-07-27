import {
  PlayfairDisplay_400Regular,
  useFonts as usePlayfairFonts,
} from '@expo-google-fonts/playfair-display';
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
  useFonts as useIbmFonts,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
export function useAppFonts(): { ready: boolean } {
  const [playfairLoaded] = usePlayfairFonts({ PlayfairDisplay_400Regular });
  const [ibmLoaded] = useIbmFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });

  return { ready: playfairLoaded && ibmLoaded };
}
