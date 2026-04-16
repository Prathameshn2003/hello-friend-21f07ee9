import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User, Calendar, Activity, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Assessment {
  id: string;
  assessment_type: string;
  risk_score: number;
  risk_category: string;
  created_at: string;
}

const getAssessmentInfo = (type: string): { label: string; icon: string; bgColor: string; source: string | null } => {
  const lower = type.toLowerCase();
  const isAPI = lower.includes('_api');
  const source = isAPI ? 'ML API' : lower.includes('_local') ? 'Local AI' : null;
  
  if (lower.includes('pcos')) return { label: 'PCOS Assessment', icon: '🩺', bgColor: 'bg-accent/15', source };
  if (lower.includes('menopause')) return { label: 'Menopause Assessment', icon: '🌸', bgColor: 'bg-primary/15', source };
  if (lower.includes('menstrual')) return { label: 'Menstrual Health', icon: '📅', bgColor: 'bg-teal/15', source };
  return { label: type.replace(/_/g, ' '), icon: '💊', bgColor: 'bg-muted', source };
};

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    if (user) {
      // Fetch profile and assessments in parallel
      Promise.all([fetchProfile(), fetchAssessments()]);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, date_of_birth")
        .eq("id", user?.id)
        .single();

      if (data) {
        setFullName(data.full_name || "");
        setDateOfBirth(data.date_of_birth || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from("health_assessments")
        .select("id, assessment_type, risk_score, risk_category, created_at")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setAssessments(data);
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, date_of_birth: dateOfBirth || null })
        .eq("id", user?.id);

      if (error) throw error;
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-28 md:pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Your Profile</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your name" />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Health History
            </h2>
            {assessments.length === 0 ? (
              <p className="text-muted-foreground text-sm">No assessments yet. Complete a health module to see your history.</p>
            ) : (
              <div className="space-y-3">
                {assessments.map((a) => {
                  const info = getAssessmentInfo(a.assessment_type);
                  const riskColor = (a.risk_score ?? 0) <= 30 ? "text-teal" : (a.risk_score ?? 0) <= 60 ? "text-accent" : "text-destructive";
                  const riskBg = (a.risk_score ?? 0) <= 30 ? "bg-teal/10" : (a.risk_score ?? 0) <= 60 ? "bg-accent/10" : "bg-destructive/10";
                  const riskLabel = (a.risk_score ?? 0) <= 30 ? "Low Risk" : (a.risk_score ?? 0) <= 60 ? "Moderate" : "High Risk";
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-muted/50 border border-border/50">
                      <div className={`w-10 h-10 rounded-xl ${info.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-lg">{info.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">{info.label}</span>
                          {info.source && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                              {info.source}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          {new Date(a.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className={`text-lg font-bold ${riskColor}`}>{a.risk_score}%</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${riskBg} ${riskColor}`}>{riskLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
