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

  //  FIXED reportFalse function
  const reportFalse = (id: string) => {
    setIncidents((prev) =>
      prev.map((incident) =>
        incident.id === id
          ? { ...incident, reportedFalse: (incident.reportedFalse || 0) + 1 }
          : incident
      )
    );
  };

  useEffect(() => {
    setTimeout(() => {
      setIncidents(FALLBACK_INCIDENTS);
      setLoadingIncidents(false);
    }, 1000);
  }, []);

  const setProfile = async (p: UserProfile) => {
    setProfileState(p);
    localStorage.setItem("alliswell_profile", JSON.stringify(p));
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
      latitude: 28.6139,
      longitude: 77.209,
      time: Date.now(),
      status: "active",
      helpers: [],
    };

    setEmergency(em);

    setTimeout(() => {
      setEmergency((prev) =>
        prev
          ? {
              ...prev,
              status: "help_coming",
              helpers: ["Helper_01", "Helper_02", "Helper_03"],
            }
          : null
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
    const updatedProfile = {
      ...profile,
      isVolunteer: true,
    };

    setProfileState(updatedProfile);
  };

  const leaveVolunteer = () => {
    const updatedProfile = {
      ...profile,
      isVolunteer: false,
    };

    setProfileState(updatedProfile);
  };

  const getNearbyVolunteers = async (): Promise<UserProfile[]> => {
    return [
      {
        name: "John Doe",
        bloodGroup: "O+",
        emergencyContact: "1234567890",
        allergies: "None",
        phone: "1234567890",
        isVolunteer: true,
      },
    ];
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