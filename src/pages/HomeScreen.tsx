import { useApp } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { Shield, Activity, AlertTriangle } from "lucide-react";

export default function HomeScreen() {
  const { triggerSOS, emergency, isCountdown, countdownSeconds, cancelSOS, resolveEmergency, profile } = useApp();
  const navigate = useNavigate();

  if (isCountdown) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-secondary px-6 fade-in">
        <AlertTriangle className="w-16 h-16 text-warning mb-6" />
        <h1 className="text-3xl font-black text-secondary-foreground mb-2">Crash Detected</h1>
        <p className="text-secondary-foreground/70 text-center mb-8 text-sm">
          SOS will be sent automatically. Tap cancel if you're okay.
        </p>
        <div className="relative w-40 h-40 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-warning/30" />
          <svg className="absolute inset-0 w-40 h-40 -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80" cy="80" r="76"
              fill="none"
              stroke="hsl(var(--warning))"
              strokeWidth="4"
              strokeDasharray={478}
              strokeDashoffset={478 - (478 * countdownSeconds) / 20}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="text-6xl font-black text-secondary-foreground countdown-pulse">
            {countdownSeconds}
          </span>
        </div>
        <button
          onClick={cancelSOS}
          className="w-full max-w-xs py-4 rounded-xl bg-background text-foreground font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          I'm OK — Cancel
        </button>
      </div>
    );
  }

  if (emergency) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-primary px-6 fade-in">
        <div className="w-20 h-20 rounded-full bg-primary-foreground/20 flex items-center justify-center mb-6 sos-pulse">
          <Shield className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-black text-primary-foreground mb-2">
          {emergency.status === "help_coming" ? "Help is on the way!" : "Sending SOS..."}
        </h1>
        <p className="text-primary-foreground/80 text-center mb-4 text-sm">
          {emergency.status === "help_coming"
            ? `${emergency.helpers.length} helpers responding`
            : "Alerting nearby helpers and emergency services"}
        </p>

        {emergency.status === "help_coming" && (
          <div className="bg-primary-foreground/10 rounded-xl p-4 w-full max-w-xs mb-6 slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-foreground/70 text-xs font-medium">ETA</span>
              <span className="text-primary-foreground font-bold">~8 min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary-foreground/70 text-xs font-medium">Helpers</span>
              <span className="text-primary-foreground font-bold">{emergency.helpers.join(", ")}</span>
            </div>
          </div>
        )}

        {profile.name && (
          <div className="bg-primary-foreground/10 rounded-xl p-4 w-full max-w-xs mb-6 slide-up">
            <p className="text-primary-foreground/70 text-[10px] font-semibold uppercase tracking-wider mb-2">
              Medical Info Shared
            </p>
            <div className="space-y-1 text-primary-foreground text-sm">
              <p><span className="opacity-70">Name:</span> {profile.name}</p>
              {profile.bloodGroup && <p><span className="opacity-70">Blood:</span> {profile.bloodGroup}</p>}
              {profile.allergies && <p><span className="opacity-70">Allergies:</span> {profile.allergies}</p>}
              {profile.emergencyContact && <p><span className="opacity-70">Contact:</span> {profile.emergencyContact}</p>}
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/map")}
          className="w-full max-w-xs py-3 rounded-xl bg-primary-foreground/20 text-primary-foreground font-bold text-sm mb-3 active:scale-95 transition-transform"
        >
          View Live Map
        </button>
        <button
          onClick={() => {
            if (window.confirm("Mark emergency as resolved?")) {
              resolveEmergency();
            }
          }}
          className="text-primary-foreground/60 text-sm underline"
        >
          Mark as Resolved
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-6 pt-16 pb-24 fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-black text-foreground tracking-tight">AllisWell</h1>
      </div>
      <p className="text-muted-foreground text-xs mb-12">Emergency Response System</p>

      {/* SOS Button */}
      <div className="relative mb-12">
        <div className="absolute inset-0 rounded-full bg-primary/20 sos-ring" />
        <div className="absolute inset-[-16px] rounded-full bg-primary/10 sos-ring sos-ring-delayed" />
        <button
          onClick={triggerSOS}
          className="relative w-44 h-44 rounded-full bg-primary flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-transform z-10 sos-button"
        >
          <span className="text-primary-foreground text-4xl font-black">SOS</span>
          <span className="text-primary-foreground/70 text-[10px] font-semibold mt-1">TAP FOR HELP</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={triggerSOS}
          className="w-full flex items-center gap-3 p-4 rounded-xl bg-muted active:bg-muted/70 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-warning" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-foreground">Simulate Crash Detection</p>
            <p className="text-[11px] text-muted-foreground">Test automatic SOS with 20s countdown</p>
          </div>
        </button>

        {!profile.name && (
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 active:bg-primary/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-primary">Set up your profile</p>
              <p className="text-[11px] text-muted-foreground">Add medical info for emergencies</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
