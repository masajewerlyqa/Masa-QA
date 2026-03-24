"use client";

import dynamic from "next/dynamic";
import type { Store } from "@/lib/types";
import { useI18n } from "@/components/useI18n";

const StoreLocationMap = dynamic(
  () => import("@/components/map/StoreLocationMap").then((m) => m.StoreLocationMap),
  { ssr: false, loading: () => <div className="h-[280px] rounded-lg bg-masa-light animate-pulse border border-primary/20" /> }
);

type Props = { store: Store };

export function StoreLocationMapSection({ store }: Props) {
  const { isArabic } = useI18n();
  const lat = store.latitude;
  const lng = store.longitude;
  const hasCoords = lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng);

  if (!hasCoords) {
    return (
      <div className="rounded-lg border border-primary/20 bg-masa-light p-6 text-center text-masa-gray font-sans text-sm">
        {isArabic ? "لم يتم تحديد موقع على الخريطة." : "No map location set."}
      </div>
    );
  }

  return (
    <StoreLocationMap
      latitude={lat}
      longitude={lng}
      storeName={store.name}
      height="280px"
    />
  );
}
