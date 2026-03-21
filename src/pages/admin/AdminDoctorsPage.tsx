import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2, Plus, Trash2, BadgeCheck, MapPin, Phone,
  Stethoscope, ToggleLeft, ToggleRight
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SPECIALIZATIONS = [
  "PCOS Specialist",
  "Gynecologist",
  "Endocrinologist",
  "Fertility Expert",
  "Menopause Specialist",
];

interface DoctorForm {
  name: string;
  specialization: string;
  city: string;
  address: string;
  phone: string;
  experience: string;
  qualification: string;
  hospital: string;
  description: string;
  is_verified: boolean;
}

const emptyForm: DoctorForm = {
  name: "",
  specialization: "",
  city: "",
  address: "",
  phone: "",
  experience: "",
  qualification: "",
  hospital: "",
  description: "",
  is_verified: false,
};

const AdminDoctorsPage = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DoctorForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ["admin-doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.specialization || !form.city || !form.address || !form.phone || !form.experience) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("doctors").insert({
        name: form.name,
        specialization: form.specialization,
        city: form.city,
        address: form.address,
        phone: form.phone,
        experience: form.experience,
        qualification: form.qualification || null,
        hospital: form.hospital || null,
        description: form.description || null,
        is_verified: form.is_verified,
        is_active: true,
      });
      if (error) throw error;
      toast({ title: "🎉 Doctor Added Successfully" });
      setForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
    } catch {
      toast({ title: "Failed to add doctor", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("doctors").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      toast({ title: "Doctor status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const toggleVerified = useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      const { error } = await supabase.from("doctors").update({ is_verified }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      toast({ title: "Verified status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update", variant: "destructive" });
    },
  });

  const softDelete = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("doctors").update({ is_active: false }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctors"] });
      toast({ title: "Doctor removed successfully" });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: "Unable to delete doctor", variant: "destructive" });
    },
  });

  const updateField = (field: keyof DoctorForm, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-20">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8 lg:ml-0">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="w-7 h-7 text-primary" />
                Manage Doctors
              </h1>
              <p className="text-muted-foreground mt-1">Add, manage, and control doctor visibility</p>
            </div>

            {/* Add Doctor Form */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                Add New Doctor
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Doctor Name *</Label>
                  <Input value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="Dr. Name" />
                </div>
                <div>
                  <Label>Specialization *</Label>
                  <Select value={form.specialization} onValueChange={v => updateField("specialization", v)}>
                    <SelectTrigger><SelectValue placeholder="Select specialization" /></SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>City *</Label>
                  <Input value={form.city} onChange={e => updateField("city", e.target.value)} placeholder="City" />
                </div>
                <div>
                  <Label>Full Address *</Label>
                  <Input value={form.address} onChange={e => updateField("address", e.target.value)} placeholder="Clinic address" />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input value={form.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+91..." />
                </div>
                <div>
                  <Label>Experience *</Label>
                  <Input value={form.experience} onChange={e => updateField("experience", e.target.value)} placeholder="e.g., 10 years" />
                </div>
                <div>
                  <Label>Qualification</Label>
                  <Input value={form.qualification} onChange={e => updateField("qualification", e.target.value)} placeholder="MBBS, MD" />
                </div>
                <div>
                  <Label>Hospital</Label>
                  <Input value={form.hospital} onChange={e => updateField("hospital", e.target.value)} placeholder="Hospital name" />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => updateField("description", e.target.value)} placeholder="Short bio..." />
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.is_verified} onCheckedChange={v => updateField("is_verified", v)} />
                  <Label>Mark as Verified</Label>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={submitting} className="gap-2">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add Doctor
                  </Button>
                </div>
              </form>
            </div>

            {/* Doctors List */}
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
                All Doctors ({doctors.length})
              </h2>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : doctors.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No doctors added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {doctors.map((doc: any) => (
                    <div key={doc.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{doc.name}</h3>
                          {doc.is_verified && <BadgeCheck className="w-4 h-4 text-teal flex-shrink-0" />}
                          <Badge variant={doc.is_active ? "default" : "secondary"} className="text-xs">
                            {doc.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-accent">{doc.specialization}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                          {doc.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{doc.city}</span>}
                          {doc.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{doc.phone}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => toggleVerified.mutate({ id: doc.id, is_verified: !doc.is_verified })}
                        >
                          <BadgeCheck className={`w-4 h-4 ${doc.is_verified ? "text-teal" : "text-muted-foreground"}`} />
                          {doc.is_verified ? "Verified" : "Unverified"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => toggleActive.mutate({ id: doc.id, is_active: !doc.is_active })}
                        >
                          {doc.is_active ? (
                            <><ToggleRight className="w-4 h-4 text-teal" /> Active</>
                          ) : (
                            <><ToggleLeft className="w-4 h-4 text-muted-foreground" /> Inactive</>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this doctor?</AlertDialogTitle>
            <AlertDialogDescription>
              This will hide the doctor from users. The record will remain in the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && softDelete.mutate(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {softDelete.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDoctorsPage;
