import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

interface HealthResourceFormProps {
  resource?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const HealthResourceForm = ({ resource, onSuccess, onCancel }: HealthResourceFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: resource?.title || "",
    description: resource?.description || "",
    category: resource?.category || "General",
    external_link: resource?.external_link || "",
    status: resource?.status || "Draft",
    is_active: resource?.is_active ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.category.trim()) {
      toast({ title: "Missing fields", description: "Title and category are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category.trim(),
        external_link: form.external_link.trim() || null,
        status: form.status,
        is_active: form.is_active,
      };

      if (resource) {
        const { error } = await supabase.from("health_resources").update(payload).eq("id", resource.id);
        if (error) throw error;
        toast({ title: "Resource updated" });
      } else {
        const { error } = await supabase.from("health_resources").insert(payload);
        if (error) throw error;
        toast({ title: "Resource created" });
      }
      onSuccess();
    } catch (error: any) {
      console.error("Health resource save error:", error);
      toast({ title: "Error saving resource", description: error.message || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onCancel} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <h2 className="font-heading text-xl font-semibold">{resource ? "Edit" : "Add"} Health Resource</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
        <div>
          <Label>Category *</Label>
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Menstrual">Menstrual</SelectItem>
              <SelectItem value="PCOS">PCOS</SelectItem>
              <SelectItem value="Menopause">Menopause</SelectItem>
              <SelectItem value="General Wellness">General Wellness</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
        <div><Label>External Link</Label><Input value={form.external_link} onChange={e => setForm(f => ({ ...f, external_link: e.target.value }))} placeholder="https://..." /></div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded border-border" />
          <Label htmlFor="is_active">Active (visible to users)</Label>
        </div>
        <Button type="submit" disabled={loading}>{loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{resource ? "Update" : "Create"}</Button>
      </form>
    </div>
  );
};
