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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      if (resource) {
        const { error } = await supabase.from("health_resources").update(form).eq("id", resource.id);
        if (error) throw error;
        toast({ title: "Resource updated" });
      } else {
        const { error } = await supabase.from("health_resources").insert(form);
        if (error) throw error;
        toast({ title: "Resource created" });
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
      <h2 className="font-heading text-xl font-semibold">{resource ? "Edit" : "Add"} Health Resource</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
        <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} /></div>
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
        <div><Label>External Link</Label><Input value={form.external_link} onChange={e => setForm(f => ({ ...f, external_link: e.target.value }))} /></div>
        <Button type="submit" disabled={loading}>{loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{resource ? "Update" : "Create"}</Button>
      </form>
    </div>
  );
};
