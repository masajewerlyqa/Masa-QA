"use client";

import dynamic from "next/dynamic";

const QatarLocationPicker = dynamic(
  () => import("@/components/map/QatarLocationPicker").then((m) => m.QatarLocationPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] rounded-lg bg-masa-light animate-pulse border border-primary/20" />
    ),
  }
);

type Props = {
  onSelect: (lat: number, lng: number) => void;
  initialLat?: number | null;
  initialLng?: number | null;
};

export function CheckoutMapPicker({ onSelect, initialLat, initialLng }: Props) {
  return (
    <QatarLocationPicker
      onSelect={onSelect}
      initialLat={initialLat}
      initialLng={initialLng}
      height="300px"
    />
  );
}
