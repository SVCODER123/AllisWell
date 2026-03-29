import { useApp } from "@/context/AppContext";
import { MapPin, Navigation, Phone, User } from "lucide-react";

export default function MapScreen() {
  const { emergency } = useApp();

  return (
    <div className="flex flex-col min-h-screen pb-20 fade-in">
      {/* Map placeholder */}
      <div className="relative flex-1 bg-muted min-h-[60vh]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-full h-full"
            style={{
              background: `
                linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(215 20% 92%) 100%)
              `,
            }}
          >
            {/* Grid lines to simulate map */}
            <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Accident marker */}
            {emergency && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-[-20px] rounded-full bg-primary/20 sos-ring" />
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg z-10 relative">
                    <MapPin className="w-6 h-6 text-primary-foreground" />
                  </div>
                </div>
              </div>
            )}

            {/* Helper markers */}
            {emergency?.status === "help_coming" && (
              <>
                <div className="absolute top-[35%] left-[30%]">
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-md">
                    <Navigation className="w-4 h-4 text-success-foreground" />
                  </div>
                </div>
                <div className="absolute top-[60%] left-[65%]">
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-md">
                    <Navigation className="w-4 h-4 text-success-foreground" />
                  </div>
                </div>
              </>
            )}

            {!emergency && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <MapPin className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground/60 font-medium text-sm">No active emergency</p>
                <p className="text-muted-foreground/40 text-xs mt-1">Map will activate during SOS</p>
              </div>
            )}
          </div>
        </div>
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
