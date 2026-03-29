import { useNavigate, useLocation } from "react-router-dom";
import { Home, MapPin, Newspaper, User } from "lucide-react";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/map", icon: MapPin, label: "Map" },
  { path: "/feed", icon: Newspaper, label: "Feed" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
