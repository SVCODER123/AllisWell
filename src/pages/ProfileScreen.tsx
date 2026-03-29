import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Shield, Save, CheckCircle } from "lucide-react";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfileScreen() {
  const { profile, setProfile } = useApp();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen pb-20 fade-in">
      <div className="px-6 pt-16 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-black text-foreground">Emergency Profile</h1>
        </div>
        <p className="text-xs text-muted-foreground">This info is shared with helpers during an SOS</p>
      </div>

      <div className="px-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-medium placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+91 98765 43210"
            className="w-full px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-medium placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Blood Group
          </label>
          <div className="grid grid-cols-4 gap-2">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setForm({ ...form, bloodGroup: bg })}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                  form.bloodGroup === bg
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-foreground"
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Emergency Contact
          </label>
          <input
            type="tel"
            value={form.emergencyContact}
            onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
            placeholder="Emergency contact number"
            className="w-full px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-medium placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Allergies
          </label>
          <textarea
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            placeholder="e.g., Penicillin, Peanuts, None"
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-medium placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform mt-4"
        >
          {saved ? (
            <>
              <CheckCircle className="w-5 h-5" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" /> Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}
