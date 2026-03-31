import { useApp } from "@/context/AppContext";
import { Shield, MapPin, Phone, Heart, AlertTriangle, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function YourProfileScreen() {
  const { profile } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20 fade-in">
      <div className="px-6 pt-16 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-black text-foreground">Your Profile</h1>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
          >
            <Edit className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">View your emergency information</p>
      </div>

      <div className="px-6 space-y-6">
        {profile.name ? (
          <>
            <div className="bg-card rounded-xl p-6 border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-foreground">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground">Emergency Contact Ready</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{profile.phone}</p>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                  </div>
                </div>

                {profile.bloodGroup && (
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{profile.bloodGroup}</p>
                      <p className="text-xs text-muted-foreground">Blood Group</p>
                    </div>
                  </div>
                )}

                {profile.emergencyContact && (
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{profile.emergencyContact}</p>
                      <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    </div>
                  </div>
                )}

                {profile.allergies && (
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{profile.allergies}</p>
                      <p className="text-xs text-muted-foreground">Allergies</p>
                    </div>
                  </div>
                )}

                {profile.isVolunteer && (
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-green-500">Active Volunteer</p>
                      <p className="text-xs text-muted-foreground">Ready to help in emergencies</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {profile.isVolunteer && profile.location && (
              <div className="bg-card rounded-xl p-6 border">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Volunteer Location</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Latitude: {profile.location.latitude.toFixed(4)}<br />
                  Longitude: {profile.location.longitude.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Your location is shared with emergency services when you're on duty as a volunteer.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-card rounded-xl p-6 border text-center">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Profile Set Up</h3>
            <p className="text-sm text-muted-foreground">
              Please set up your emergency profile to view your information here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}