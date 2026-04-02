"use client";

import { useCallback, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/** Qatar center (Doha). */
const QATAR_CENTER: [number, number] = [25.2854, 51.531];
const QATAR_BOUNDS: L.LatLngBoundsExpression = [
  [24.4, 50.6],
  [26.4, 52.6],
];

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  initialLat?: number | null;
  initialLng?: number | null;
  onSelect: (lat: number, lng: number) => void;
  height?: string;
};

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect(lat, lng);
    },
  });
  return null;
}

export function QatarLocationPicker({ initialLat, initialLng, onSelect, height = "320px" }: Props) {
  const hasInitial = initialLat != null && initialLng != null && !Number.isNaN(initialLat) && !Number.isNaN(initialLng);
  const [position, setPosition] = useState<[number, number] | null>(
    hasInitial ? [Number(initialLat), Number(initialLng)] : null
  );

  const handleSelect = useCallback(
    (lat: number, lng: number) => {
      setPosition([lat, lng]);
      onSelect(lat, lng);
    },
    [onSelect]
  );

  const center: [number, number] = position ?? QATAR_CENTER;
  const zoom = position ? 14 : 10;

  return (
    <div
      className="masa-leaflet-site-scope relative z-0 isolate rounded-lg overflow-hidden border border-primary/20"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        maxBounds={QATAR_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelect={handleSelect} />
        {position && <Marker position={position} icon={defaultIcon} />}
      </MapContainer>
    </div>
  );
}
