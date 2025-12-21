"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, FeatureGroup, useMap, Rectangle } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";

const fixLeafletIcons = () => {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
};

interface MapProps {
  onAreaSelect: (coords: { lat: number; lng: number }) => void;
  targetCoords: { lat: number | null; lng: number | null };
}
const MapController = ({ coords }: { coords: { lat: number | null; lng: number | null } }) => {
  const map = useMap();

  useEffect(() => {
    if (coords.lat && coords.lng) {
      map.flyTo([coords.lat, coords.lng], 13, { duration: 1.5 });
    }
  }, [coords, map]);

  return null;
};

const Map = ({ onAreaSelect, targetCoords }: MapProps) => {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const _onCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === "rectangle" || layerType === "polygon") {
      const bounds = layer.getBounds();
      const center = bounds.getCenter();
      onAreaSelect({ lat: center.lat, lng: center.lng });
    }
  };

  const manualBox = targetCoords.lat && targetCoords.lng 
    ? [
        [targetCoords.lat - 0.01, targetCoords.lng - 0.01],
        [targetCoords.lat + 0.01, targetCoords.lng + 0.01]
      ] as L.LatLngBoundsExpression
    : null;

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={[-3.46, -62.21]} 
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        className="z-0 bg-black"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController coords={targetCoords} />
        {manualBox && (
            <Rectangle bounds={manualBox} pathOptions={{ color: '#10b981', weight: 2, fillOpacity: 0.1 }} />
        )}

        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={_onCreated}
            draw={{
              rectangle: true,
              polygon: true,
              circle: false,
              polyline: false,
              marker: false,
              circlemarker: false,
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default Map;