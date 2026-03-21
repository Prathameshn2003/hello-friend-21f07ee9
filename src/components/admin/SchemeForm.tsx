import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

interface SchemeFormProps {
  scheme?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const SchemeForm = ({ scheme, onSuccess, onCancel }: SchemeFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: scheme?.name || "",
    description: scheme?.description || "",
    category: scheme?.category || "",
    eligibility: scheme?.eligibility || "",
    benefits: scheme?.benefits || "",
    how_to_apply: scheme?.how_to_apply || "",
    website: scheme?.website || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      if (scheme) {
        const { error } = await supabase.from("schemes").update(form).eq("id", scheme.id);
        if (error) throw error;
        toast({ title: "Scheme updated" });
      } else {
        const { error } = await supabase.from("schemes").insert(form);
        if (error) throw error;
        toast({ title: "Scheme created" });
      }
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onCancel} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <h2 className="font-heading text-xl font-semibold">{scheme ? "Edit" : "Add"} Scheme</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
        <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        <div><Label>Eligibility</Label><Textarea value={form.eligibility} onChange={e => setForm(f => ({ ...f, eligibility: e.target.value }))} /></div>
        <div><Label>Benefits</Label><Textarea value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))} /></div>
        <div><Label>How to Apply</Label><Textarea value={form.how_to_apply} onChange={e => setForm(f => ({ ...f, how_to_apply: e.target.value }))} /></div>
        <div><Label>Website</Label><Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} /></div>
        <Button type="submit" disabled={loading}>{loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{scheme ? "Update" : "Create"}</Button>
      </form>
    </div>
  );
};
