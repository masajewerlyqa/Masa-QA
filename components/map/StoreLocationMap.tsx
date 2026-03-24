"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type Props = {
  latitude: number;
  longitude: number;
  storeName?: string;
  height?: string;
};

export function StoreLocationMap({ latitude, longitude, storeName, height = "280px" }: Props) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="rounded-lg overflow-hidden border border-primary/20" style={{ height }}>
      <MapContainer
        center={position}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={defaultIcon} title={storeName ?? "Location"} />
      </MapContainer>
    </div>
  );
}
