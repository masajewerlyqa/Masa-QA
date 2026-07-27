import { useCallback, useEffect, useState } from 'react';

import { MarketPricesContent } from '../components/market-prices/MarketPricesContent';
import { MarketingPageScroll } from '../components/page-layout/MarketingPageScroll';
import { fetchMarketPrices } from '../services/marketPricesService';
import type { AllMarketData } from '../types/marketPrices';

export function MarketPricesScreen(): React.JSX.Element {
  const [data, setData] = useState<AllMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'api' | 'gold-prices' | 'fallback' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchMarketPrices({ allowFallback: true });
    if (result.ok) {
      setData(result.data);
      setSource(result.source);
      if (result.source === 'fallback') {
        setError(
          'Showing cached estimates — connect to your MASA site API for live prices. Check EXPO_PUBLIC_SITE_URL.',
        );
      }
    } else {
      setData(null);
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <MarketingPageScroll>
      <MarketPricesContent
        data={data}
        error={error}
        loading={loading}
        onRetry={() => void load()}
        source={source ?? undefined}
      />
    </MarketingPageScroll>
  );
}
