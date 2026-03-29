import { useApp } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Phone, User, Navigation } from "lucide-react";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const emergencyIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const helperIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
}

export default function MapScreen() {
  const { emergency } = useApp();
  const [userPos, setUserPos] = useState<[number, number]>([28.6139, 77.209]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {} // fallback to default
    );
  }, []);

  const center: [number, number] = emergency
    ? [emergency.latitude, emergency.longitude]
    : userPos;

  const helperPositions: [number, number][] = emergency?.status === "help_coming"
    ? [
        [center[0] + 0.008, center[1] - 0.012],
        [center[0] - 0.006, center[1] + 0.01],
      ]
    : [];

  return (
    <div className="flex flex-col min-h-screen pb-20 fade-in">
      <div className="relative flex-1 min-h-[60vh]">
        <MapContainer
          center={center}
          zoom={14}
          className="w-full h-full min-h-[60vh]"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap lat={center[0]} lng={center[1]} />

          {/* User/Emergency marker */}
          <Marker position={center} icon={emergency ? emergencyIcon : undefined}>
            <Popup>{emergency ? "🚨 Emergency Location" : "📍 Your Location"}</Popup>
          </Marker>

          {/* Helper markers */}
          {helperPositions.map((pos, i) => (
            <Marker key={i} position={pos} icon={helperIcon}>
              <Popup>🟢 {emergency?.helpers[i] || "Helper"} — responding</Popup>
            </Marker>
          ))}
        </MapContainer>

        {!emergency && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none z-[1000]">
            <div className="bg-background/90 backdrop-blur rounded-xl px-4 py-3 shadow-lg">
              <p className="text-muted-foreground font-medium text-sm">No active emergency</p>
              <p className="text-muted-foreground/60 text-xs mt-0.5">Map will highlight during SOS</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom panel */}
      {emergency && (
        <div className="bg-background border-t border-border p-4 slide-up">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-medium">EMERGENCY ACTIVE</p>
              <p className="font-bold text-foreground">
                {emergency.status === "help_coming" ? "Help is on the way" : "Locating helpers..."}
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              ETA ~8 min
            </div>
          </div>

          {emergency.helpers.length > 0 && (
            <div className="space-y-2">
              {emergency.helpers.map((helper, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{helper}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {i === 0 ? "2.3 km away" : "3.1 km away"}
                      </p>
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                    <Phone className="w-4 h-4 text-success-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
