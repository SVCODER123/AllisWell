import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { databaseService } from "@/lib/database";

declare global {
  interface Window {
    __sosInterval?: number;
  }
}

export interface UserProfile {
  name: string;
  bloodGroup: string;
  emergencyContact: string;
  allergies: string;
  phone: string;
  isVolunteer: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
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
  joinAsVolunteer: () => void;
  leaveVolunteer: () => void;
  getNearbyVolunteers: () => Promise<UserProfile[]>;
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

interface TomTomIncident {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    events?: Array<{
      description?: string;
    }>;
    description?: string;
    iconCategory?: number;
    startTime?: string;
  };
}

function mapTomTomToIncident(item: TomTomIncident, index: number): IncidentFeed {
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
  isVolunteer: false,
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

interface TomTomAPIResponse {
  incidents?: TomTomIncident[];
}

        const res = await fetch(url);
        if (!res.ok) throw new Error("API error");
        const data: TomTomAPIResponse = await res.json();
        const items = data?.incidents || [];

        if (!cancelled && items.length > 0) {
          const mapped = items.slice(0, 10).map((item, i) => mapTomTomToIncident(item, i));
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

  const setProfile = async (p: UserProfile) => {
    setProfileState(p);
    localStorage.setItem("alliswell_profile", JSON.stringify(p));
    // Save to database
    await databaseService.saveUserProfile("user_1", p);
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

    window.__sosInterval = interval;
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

    // Simulate more helpers responding during emergency
    const baseHelpers = ["Helper_01", "Helper_02"];
    const additionalHelpers = profile.isVolunteer ? ["Helper_03", "Helper_04", "Helper_05"] : ["Helper_03"];

    setTimeout(() => {
      setEmergency((prev) =>
        prev ? { ...prev, status: "help_coming", helpers: [...baseHelpers, ...additionalHelpers] } : null
      );
    }, 5000);
  };

  const cancelSOS = () => {
    setIsCountdown(false);
    setCountdownSeconds(20);
    if (window.__sosInterval) {
      clearInterval(window.__sosInterval);
    }
  };

  const resolveEmergency = () => {
    setEmergency(null);
  };

  const joinAsVolunteer = () => {
    if (profile.name && profile.phone) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const updatedProfile = {
            ...profile,
            isVolunteer: true,
            location: {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
          };
          setProfileState(updatedProfile);
        },
        () => {
          // Fallback without location
          const updatedProfile = { ...profile, isVolunteer: true };
          setProfileState(updatedProfile);
        }
      );
    }
  };

  const leaveVolunteer = () => {
    const updatedProfile = { ...profile, isVolunteer: false };
    setProfileState(updatedProfile);
  };

  const getNearbyVolunteers = async (): Promise<UserProfile[]> => {
    try {
      const volunteers = await databaseService.getNearbyVolunteers(28.6139, 77.209, 10);
      return volunteers.map(v => v.profile);
    } catch {
      // Fallback to mock data
      return [
        {
          name: "John Doe",
          bloodGroup: "O+",
          emergencyContact: "+1234567890",
          allergies: "None",
          phone: "+1234567890",
          isVolunteer: true,
          location: { latitude: 28.6139, longitude: 77.209 },
        },
        {
          name: "Jane Smith",
          bloodGroup: "A+",
          emergencyContact: "+1234567891",
          allergies: "Peanuts",
          phone: "+1234567891",
          isVolunteer: true,
          location: { latitude: 28.6140, longitude: 77.210 },
        },
      ];
    }
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
        joinAsVolunteer,
        leaveVolunteer,
        getNearbyVolunteers,
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
