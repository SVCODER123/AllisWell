import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserProfile {
  name: string;
  bloodGroup: string;
  emergencyContact: string;
  allergies: string;
  phone: string;
}

export interface Emergency {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  time: number;
  status: "active" | "help_coming" | "resolved";
  helpers: string[];
}

export interface IncidentFeed {
  id: string;
  title: string;
  description: string;
  location: string;
  time: number;
  verified: boolean;
  reportedFalse: number;
  type: "accident" | "fire" | "medical" | "other";
}

interface AppState {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  emergency: Emergency | null;
  triggerSOS: () => void;
  cancelSOS: () => void;
  resolveEmergency: () => void;
  isCountdown: boolean;
  countdownSeconds: number;
  incidents: IncidentFeed[];
  loadingIncidents: boolean;
  reportFalse: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const FALLBACK_INCIDENTS: IncidentFeed[] = [
  {
    id: "f1",
    title: "Multi-vehicle collision reported",
    description: "3 vehicles involved on highway. Emergency services dispatched.",
    location: "Nearby Highway",
    time: Date.now() - 1000 * 60 * 12,
    verified: true,
    reportedFalse: 0,
    type: "accident",
  },
  {
    id: "f2",
    title: "Medical emergency near toll plaza",
    description: "Pedestrian injury. Ambulance en route.",
    location: "Toll Plaza Area",
    time: Date.now() - 1000 * 60 * 35,
    verified: true,
    reportedFalse: 1,
    type: "medical",
  },
];

function mapTomTomToIncident(item: any, index: number): IncidentFeed {
  const desc = item.properties?.events?.[0]?.description || item.properties?.description || "Traffic incident reported";
  const iconCat = item.properties?.iconCategory;
  let type: IncidentFeed["type"] = "other";
  // TomTom icon categories: 1-5 are traffic, 6 = accident, 7-9 = road work, 14 = broken vehicle
  if (iconCat === 6 || iconCat === 14) type = "accident";
  else if (iconCat >= 1 && iconCat <= 5) type = "accident";
  
  const coords = item.geometry?.coordinates;
  const locStr = coords
    ? `${coords[1]?.toFixed(3)}°N, ${coords[0]?.toFixed(3)}°E`
    : "Unknown location";

  return {
    id: `tt_${index}`,
    title: desc.slice(0, 80),
    description: item.properties?.events?.[0]?.description || desc,
    location: locStr,
    time: item.properties?.startTime
      ? new Date(item.properties.startTime).getTime()
      : Date.now() - 1000 * 60 * (10 + index * 15),
    verified: true,
    reportedFalse: 0,
    type,
  };
}

const defaultProfile: UserProfile = {
  name: "",
  bloodGroup: "",
  emergencyContact: "",
  allergies: "",
  phone: "",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("alliswell_profile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(20);
  const [incidents, setIncidents] = useState<IncidentFeed[]>([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);

  // Fetch real incidents from free API
  useEffect(() => {
    let cancelled = false;

    async function fetchIncidents(lat: number, lng: number) {
      try {
        // Use open data from TomTom free tier (no key needed for traffic flow tiles, but incidents need key)
        // Fallback: use overpass/openstreetmap based approach or mock with geolocation
        const bbox = `${lng - 0.15},${lat - 0.15},${lng + 0.15},${lat + 0.15}`;
        const url = `https://api.tomtom.com/traffic/services/5/incidentDetails?bbox=${bbox}&fields={incidents{type,geometry{type,coordinates},properties{id,iconCategory,magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,from,to,length,delay,roadNumbers,timeValidity}}}&language=en-GB&categoryFilter=0,1,2,3,4,5,6,7,8,9,10,11,14&timeValidityFilter=present&key=sSi0hXfj3G0eSfGr9G52tAEhzBnMWHoE`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const items = data?.incidents || [];

        if (!cancelled && items.length > 0) {
          const mapped = items.slice(0, 10).map((item: any, i: number) => mapTomTomToIncident(item, i));
          setIncidents(mapped);
        } else if (!cancelled) {
          setIncidents(FALLBACK_INCIDENTS);
        }
      } catch {
        if (!cancelled) setIncidents(FALLBACK_INCIDENTS);
      } finally {
        if (!cancelled) setLoadingIncidents(false);
      }
    }

    navigator.geolocation?.getCurrentPosition(
      (pos) => fetchIncidents(pos.coords.latitude, pos.coords.longitude),
      () => {
        // Fallback coords (Delhi)
        fetchIncidents(28.6139, 77.209);
      }
    );

    return () => { cancelled = true; };
  }, []);

  const setProfile = (p: UserProfile) => {
    setProfileState(p);
    localStorage.setItem("alliswell_profile", JSON.stringify(p));
  };

  const triggerSOS = () => {
    setIsCountdown(true);
    setCountdownSeconds(20);

    let seconds = 20;
    const interval = setInterval(() => {
      seconds--;
      setCountdownSeconds(seconds);
      if (seconds <= 0) {
        clearInterval(interval);
        setIsCountdown(false);
        activateEmergency();
      }
    }, 1000);

    (window as any).__sosInterval = interval;
  };

  const activateEmergency = () => {
    const em: Emergency = {
      id: Date.now().toString(),
      userId: "user_1",
      latitude: 28.6139 + (Math.random() - 0.5) * 0.01,
      longitude: 77.209 + (Math.random() - 0.5) * 0.01,
      time: Date.now(),
      status: "active",
      helpers: [],
    };
    setEmergency(em);

    setTimeout(() => {
      setEmergency((prev) =>
        prev ? { ...prev, status: "help_coming", helpers: ["Helper_01", "Helper_02"] } : null
      );
    }, 5000);
  };

  const cancelSOS = () => {
    setIsCountdown(false);
    setCountdownSeconds(20);
    if ((window as any).__sosInterval) {
      clearInterval((window as any).__sosInterval);
    }
  };

  const resolveEmergency = () => {
    setEmergency(null);
  };

  const reportFalse = (id: string) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, reportedFalse: i.reportedFalse + 1 } : i))
    );
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        emergency,
        triggerSOS,
        cancelSOS,
        resolveEmergency,
        isCountdown,
        countdownSeconds,
        incidents,
        loadingIncidents,
        reportFalse,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
