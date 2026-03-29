import { createContext, useContext, useState, ReactNode } from "react";

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
  reportFalse: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const MOCK_INCIDENTS: IncidentFeed[] = [
  {
    id: "1",
    title: "Multi-vehicle collision on NH-48",
    description: "3 vehicles involved near Km 42. Emergency services dispatched. Avoid the area.",
    location: "NH-48, Km 42",
    time: Date.now() - 1000 * 60 * 12,
    verified: true,
    reportedFalse: 0,
    type: "accident",
  },
  {
    id: "2",
    title: "Medical emergency reported",
    description: "Pedestrian injury near toll plaza. Ambulance en route.",
    location: "City Toll Plaza",
    time: Date.now() - 1000 * 60 * 35,
    verified: true,
    reportedFalse: 1,
    type: "medical",
  },
  {
    id: "3",
    title: "Vehicle fire on service road",
    description: "Car fire reported. Fire department responding. Traffic diverted.",
    location: "Service Road, Sector 5",
    time: Date.now() - 1000 * 60 * 58,
    verified: false,
    reportedFalse: 3,
    type: "fire",
  },
];

const defaultProfile: UserProfile = {
  name: "",
  bloodGroup: "",
  emergencyContact: "",
  allergies: "",
  phone: "",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("lifeline_profile");
    return saved ? JSON.parse(saved) : defaultProfile;
  });
  const [emergency, setEmergency] = useState<Emergency | null>(null);
  const [isCountdown, setIsCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(20);
  const [incidents, setIncidents] = useState<IncidentFeed[]>(MOCK_INCIDENTS);

  const setProfile = (p: UserProfile) => {
    setProfileState(p);
    localStorage.setItem("lifeline_profile", JSON.stringify(p));
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

    // Simulate helper response
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
