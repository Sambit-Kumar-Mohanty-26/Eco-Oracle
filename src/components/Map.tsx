"use client";

import { useEffect, useState, useCallback, useRef, SetStateAction } from "react";
import { 
  MapContainer, 
  TileLayer, 
  FeatureGroup, 
  useMap, 
  Rectangle, 
  Marker, 
  Popup,
  useMapEvents
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { 
  Layers, 
  Check, 
  Search, 
  Crosshair, 
  Map as MapIcon, 
  Navigation, 
  Globe, 
  Monitor, 
  Zap,
  X,
  AlertCircle
} from "lucide-react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

interface BoundingBox {
  lat: number;
  lng: number;
  bounds?: number[][];
}

interface MapProps {
  onAreaSelect: (coords: BoundingBox) => void;
  targetCoords: { lat: number | null; lng: number | null; bounds?: number[][] | null };
}

const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div class="relative flex items-center justify-center w-12 h-12">
        <div class="absolute w-full h-full bg-emerald-500/20 rounded-full animate-ping delay-75"></div>
        <div class="absolute w-[70%] h-[70%] bg-emerald-500/40 rounded-full animate-ping"></div>
        <div class="relative z-10 w-10 h-10 bg-zinc-950 rounded-full border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  });
};

const HUD = () => {
  const map = useMap();
  const [status, setStatus] = useState({ lat: 0, lng: 0, zoom: 0 });

  useMapEvents({
    mousemove: (e) => {
      setStatus(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
    },
    zoomend: () => {
      setStatus(prev => ({ ...prev, zoom: map.getZoom() }));
    }
  });

  return (
    <div className="absolute bottom-6 left-6 z-5000 pointer-events-none flex flex-col gap-2 font-mono">
      <div className="flex items-center gap-4 text-[10px] font-bold text-emerald-400 bg-black/90 backdrop-blur-md px-4 py-2 rounded-lg border border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-2 min-w-20">
            <Crosshair size={12} className="text-emerald-500" />
            <span>LAT: {status.lat.toFixed(4)}</span>
        </div>
        <div className="w-px h-3 bg-zinc-700"></div>
        <div className="flex items-center gap-2 min-w-20">
            <Navigation size={12} className="text-emerald-500" />
            <span>LNG: {status.lng.toFixed(4)}</span>
        </div>
        <div className="w-px h-3 bg-zinc-700"></div>
        <div className="flex items-center gap-2 text-zinc-500">
            <Globe size={12} />
            <span>Z: {status.zoom || map.getZoom()}</span>
        </div>
      </div>
    </div>
  );
};

const ExpandableSearch = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  const map = useMap();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 3) return;
    setLoading(true);
    setError("");
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        if (data && data.length > 0) {
            setResults(data);
        } else {
            setResults([]);
            setError("No location found");
        }
    } catch (e) {
        setError("Network error");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      if (query.length < 3) { setResults([]); setError(""); return; }
      const timer = setTimeout(() => {
          performSearch(query);
      }, 800);
      return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (lat: number, lon: number) => {
    onSelect(lat, lon);
    map.flyTo([lat, lon], 14, { duration: 1.5 });
    setResults([]);
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (results.length > 0) {
            handleSelect(parseFloat(results[0].lat), parseFloat(results[0].lon));
        } else {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                 handleSelect(parseFloat(data[0].lat), parseFloat(data[0].lon));
            } else {
                setError("Location not found");
                setResults([]);
            }
        }
    }
  };

  return (
    <div className="flex flex-row-reverse items-center gap-2 relative pointer-events-auto">
      <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg shadow-xl transition-all duration-300 border z-20 ${
              isOpen 
              ? 'bg-emerald-600 text-white border-emerald-400' 
              : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-800'
          }`}
      >
          {isOpen ? <X size={18} /> : <Search size={18} />}
      </button>

      <div className={`transition-all duration-300 ease-in-out overflow-visible h-10 flex items-center ${isOpen ? 'w-70 opacity-100' : 'w-0 opacity-0'}`}>
        <div className="w-full relative">
           <input 
              ref={inputRef}
              type="text" 
              className={`w-full bg-zinc-900/95 backdrop-blur-sm text-white px-4 py-2.5 rounded-lg border border-zinc-700 shadow-xl focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm font-medium placeholder:text-zinc-600 ${!isOpen && 'hidden'}`}
              placeholder="Type & Press Enter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
          />

          {isOpen && (results.length > 0 || error) && (
             <div className="absolute bottom-12 right-0 w-75 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto custom-scrollbar z-10 flex flex-col-reverse">
                <div className="flex flex-col">
                    {error && (
                        <div className="px-4 py-3 text-red-400 text-xs flex items-center gap-2">
                            <AlertCircle size={12}/>
                            {error}
                        </div>
                    )}
                    {results.map((r, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSelect(parseFloat(r.lat), parseFloat(r.lon))}
                            className="w-full text-left px-4 py-3 text-xs text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors border-b border-zinc-800/50 last:border-0 flex items-center gap-3"
                        >
                            <MapIcon size={12} className="opacity-50 shrink-0"/>
                            <span className="truncate">{r.display_name}</span>
                        </button>
                    ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};


const ControlStack = ({ 
    mode, setMode, filter, setFilter, onLocate, onSearchSelect 
}: { 
    mode: string, setMode: any, filter: string, setFilter: any, onLocate: () => void, onSearchSelect: (lat: number, lng: number) => void
}) => {
    const [isLayerOpen, setIsLayerOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            L.DomEvent.disableClickPropagation(containerRef.current);
            L.DomEvent.disableScrollPropagation(containerRef.current);
        }
    }, []);

    const visualFilters = [
        { id: 'normal', name: 'Standard', icon: <Monitor size={14} /> },
        { id: 'midnight', name: 'Midnight', icon: <Zap size={14} /> },
        { id: 'matrix', name: 'Matrix', icon: <div className="w-3 h-3 bg-emerald-500 rounded-[1px]"/> },
    ];

    return (
        <div 
            ref={containerRef}
            className="absolute bottom-6 right-6 z-5000 flex flex-col items-end gap-3 pointer-events-auto"
        >
             <ExpandableSearch onSelect={onSearchSelect} />
             <button 
                onClick={onLocate}
                className="w-10 h-10 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-emerald-600 rounded-lg shadow-xl border border-zinc-700 transition-all flex items-center justify-center group"
                title="Locate Me"
            >
                <Navigation size={18} className="group-hover:-rotate-45 transition-transform duration-300" />
            </button>

            <div 
                className="relative flex flex-col items-end"
                onMouseEnter={() => setIsLayerOpen(true)}
                onMouseLeave={() => setIsLayerOpen(false)}
            >
                {isLayerOpen && (
                    <div className="absolute bottom-0 right-12 bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 p-3 rounded-xl shadow-2xl min-w-50 animate-in slide-in-from-right-2 fade-in">
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <button 
                                onClick={() => setMode('streets')} 
                                className={`py-2 px-2 text-[10px] font-bold uppercase rounded-md border transition-all ${mode === 'streets' ? 'bg-zinc-800 text-white border-zinc-600' : 'text-zinc-500 border-transparent hover:bg-zinc-900'}`}
                            >
                                Street
                            </button>
                            <button 
                                onClick={() => setMode('satellite')} 
                                className={`py-2 px-2 text-[10px] font-bold uppercase rounded-md border transition-all ${mode === 'satellite' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50' : 'text-zinc-500 border-transparent hover:bg-zinc-900'}`}
                            >
                                Satellite
                            </button>
                        </div>

                        <div className="h-px bg-zinc-800 w-full mb-2"></div>
                        
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2 block px-1">Visual Mode</span>
                        <div className="flex flex-col gap-1">
                            {visualFilters.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id)}
                                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        filter === f.id 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                        : 'text-zinc-400 hover:bg-zinc-900 border border-transparent'
                                    }`}
                                >
                                    {f.icon}
                                    {f.name}
                                    {filter === f.id && <Check size={12} className="ml-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                <button 
                    className={`w-10 h-10 flex items-center justify-center rounded-lg shadow-xl transition-all duration-300 border ${
                        isLayerOpen 
                        ? 'bg-emerald-600 text-white border-emerald-400' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                    }`}
                >
                    <Layers size={18} />
                </button>
            </div>
        </div>
    );
};

const Map = ({ onAreaSelect, targetCoords }: MapProps) => {
  const [mapType, setMapType] = useState('satellite');
  const [visualFilter, setVisualFilter] = useState('normal');
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  const _onCreated = useCallback((e: any) => {
    const { layerType, layer } = e;
    if (layerType === "rectangle" || layerType === "polygon") {
      const bounds = layer.getBounds();
      const center = bounds.getCenter();
      onAreaSelect({ 
        lat: center.lat, 
        lng: center.lng, 
        bounds: [
          [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
          [bounds.getNorthEast().lat, bounds.getNorthEast().lng]
        ]
      });
    }
  }, [onAreaSelect]);

  const activeBounds = targetCoords.bounds 
    ? (targetCoords.bounds as L.LatLngBoundsExpression)
    : (targetCoords.lat && targetCoords.lng 
        ? [[targetCoords.lat - 0.005, targetCoords.lng - 0.005], [targetCoords.lat + 0.005, targetCoords.lng + 0.005]] as L.LatLngBoundsExpression 
        : null);

  const handleLocate = () => {
    if (mapInstance) {
        mapInstance.locate().on("locationfound", (e) => {
            mapInstance.flyTo(e.latlng, 16);
        });
    }
  };

  return (
    <div className={`h-full w-full relative isolate bg-zinc-950 overflow-hidden map-wrapper filter-${visualFilter}`}>
      
      <MapContainer
        center={[51.505, -0.09]} 
        zoom={13}
        style={{ height: "100%", width: "100%", background: '#09090b', zIndex: 1 }}
        zoomControl={false}
        ref={setMapInstance}
      >
        <TileLayer
            attribution='&copy; Google Maps'
            url={mapType === 'satellite' 
                ? "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
                : "https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            }
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            maxZoom={20}
        />
        
        <HUD />
        
        <ControlStack 
            mode={mapType} 
            setMode={setMapType} 
            filter={visualFilter} 
            setFilter={setVisualFilter} 
            onLocate={handleLocate}
            onSearchSelect={(lat, lng) => onAreaSelect({ lat, lng })}
        />

        {activeBounds && (
          <Rectangle 
            bounds={activeBounds} 
            pathOptions={{ 
              color: '#10b981', 
              weight: 1, 
              fillOpacity: 0.1, 
              dashArray: '4, 8',
              className: 'animate-pulse' 
            }} 
          />
        )}

        {targetCoords.lat && targetCoords.lng && (
          <Marker 
            position={[targetCoords.lat, targetCoords.lng]} 
            icon={createCustomIcon()}
          >
             <Popup className="custom-popup" closeButton={false} offset={[0, -50]}>
                <div className="bg-zinc-950 border border-emerald-500/50 px-3 py-1.5 rounded shadow-xl text-center">
                    <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Target Locked</span>
                </div>
            </Popup>
          </Marker>
        )}

        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={_onCreated}
            draw={{
              rectangle: { shapeOptions: { color: '#10b981', weight: 2 } },
              polygon: { shapeOptions: { color: '#10b981', weight: 2 } },
              circle: false,
              polyline: false,
              marker: false,
              circlemarker: false,
            }}
          />
        </FeatureGroup>
      </MapContainer>

      <style jsx global>{`
        /* 
          FIX DRAW BUTTONS:
          Instead of coloring them manually, we invert the standard white buttons.
          White background -> Becomes Black
          Black icons -> Become White
        */
        .leaflet-draw-toolbar {
            margin-top: 12px !important;
            margin-right: 12px !important;
            border: 2px solid #3f3f46 !important;
            border-radius: 8px !important;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5) !important;
            overflow: hidden;
        }

        .leaflet-draw-toolbar a {
            background-color: #ffffff !important; /* Force standard white */
            filter: invert(100%) hue-rotate(180deg) brightness(0.95) !important; /* Invert to dark mode */
            border-bottom: 1px solid #ccc !important;
        }

        .leaflet-draw-toolbar a:hover {
            background-color: #f0f0f0 !important; /* Light grey -> Inverts to dark grey hover */
            filter: invert(100%) hue-rotate(180deg) brightness(1.2) !important;
        }

        .leaflet-draw-toolbar a:last-child {
            border-bottom: none !important;
        }

        /* Map Filters */
        .map-wrapper.filter-midnight .leaflet-tile-pane {
            filter: grayscale(100%) invert(100%) contrast(1.1) brightness(0.8);
        }
        .map-wrapper.filter-matrix .leaflet-tile-pane {
            filter: sepia(100%) hue-rotate(90deg) saturate(300%) contrast(1.2) brightness(0.9);
        }

        .leaflet-popup-content-wrapper { background: transparent; box-shadow: none; padding: 0; }
        .leaflet-popup-tip { display: none; }
      `}</style>
    </div>
  );
};

export default Map;