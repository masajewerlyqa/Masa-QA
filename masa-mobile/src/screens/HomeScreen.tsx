import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import {
  HomeBrandsSection,
  HomeExclusiveOffersSection,
  HomeFeaturedProductsSection,
  HomeFeaturesStrip,
  HomeHeroSection,
  HomeReviewsSection,
  HomeSellerCtaSection,
  HomeSmartFeaturesSection,
  HomeTrustSection,
} from '../components/home/HomeSections';
import { MobileFooter } from '../components/MobileFooter';
import { SiteShell } from '../components/layout/SiteShell';
import { ProductSkeletonGrid } from '../components/ui/ProductSkeleton';
import {
  getDiscountedProducts,
  getHomeProducts,
  getStoreBrands,
} from '../services/productService';
import { Product } from '../types/catalog';

export function HomeScreen(): React.JSX.Element {
  const [offers, setOffers] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([getDiscountedProducts(10), getHomeProducts(8), getStoreBrands(9)]).then(
      ([discounted, latest, storeBrands]) => {
        if (mounted) {
          setOffers(discounted);
          setProducts(latest);
          setBrands(storeBrands.length > 0 ? storeBrands : defaultBrands);
          setLoading(false);
        }
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SiteShell>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeroSection />
        {loading ? (
          <ProductSkeletonGrid count={4} />
        ) : (
          <>
            <HomeExclusiveOffersSection products={offers} />
            <HomeSmartFeaturesSection />
            <HomeTrustSection />
            <HomeFeaturesStrip />
            <HomeFeaturedProductsSection products={products} />
            <HomeBrandsSection brands={brands} />
            <HomeSellerCtaSection />
            <HomeReviewsSection />
          </>
        )}
        <MobileFooter />
      </ScrollView>
    </SiteShell>
  );
}

const defaultBrands = ['Al Noor', 'Golden Aura', 'Mira Luxe', 'Pearl House', 'Ava Jewels', 'Lumière'];

const styles = StyleSheet.create({
  scroll: {},
});
