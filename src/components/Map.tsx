"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
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
}

const Map = ({ onAreaSelect }: MapProps) => {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  const _onCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === "rectangle" || layerType === "polygon") {
      const bounds = layer.getBounds();
      const center = bounds.getCenter();
      console.log("📍 Center Selected:", center);
      onAreaSelect({ lat: center.lat, lng: center.lng });
    }
  };

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={[-3.46, -62.21]} 
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

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