import { useApp } from "@/context/AppContext";
import { Shield, ShieldCheck, ShieldAlert, Clock, Flag } from "lucide-react";

function timeAgo(ms: number) {
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

const typeColors: Record<string, string> = {
  accident: "bg-primary/10 text-primary",
  medical: "bg-warning/10 text-warning",
  fire: "bg-destructive/10 text-destructive",
  other: "bg-muted text-muted-foreground",
};

export default function FeedScreen() {
  const { incidents, reportFalse } = useApp();

  return (
    <div className="min-h-screen pb-20 fade-in">
      <div className="px-6 pt-16 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-black text-foreground">Incident Feed</h1>
        </div>
        <p className="text-xs text-muted-foreground">Verified emergency updates in your area</p>
      </div>

      <div className="px-4 space-y-3">
        {incidents.map((incident) => (
          <div key={incident.id} className="bg-background border border-border rounded-xl p-4 slide-up">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${typeColors[incident.type]}`}>
                  {incident.type}
                </span>
                {incident.verified ? (
                  <span className="flex items-center gap-1 text-[10px] text-success font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                    <ShieldAlert className="w-3 h-3" /> Unverified
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                {timeAgo(incident.time)}
              </span>
            </div>

            <h3 className="font-bold text-sm text-foreground mb-1">{incident.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{incident.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-medium">📍 {incident.location}</span>
              <button
                onClick={() => reportFalse(incident.id)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
              >
                <Flag className="w-3 h-3" />
                Report false ({incident.reportedFalse})
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
