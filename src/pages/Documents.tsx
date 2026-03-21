import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText, Upload, Trash2, Loader2,
  FileImage, File, CheckCircle2, Pencil, Download, Search, AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

interface DocumentRow {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENTS = 20;

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string) => {
  if (type === "application/pdf") return <FileText className="w-6 h-6 text-destructive" />;
  if (type.startsWith("image/")) return <FileImage className="w-6 h-6 text-teal" />;
  return <File className="w-6 h-6 text-muted-foreground" />;
};

const Documents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DocumentRow | null>(null);
  const [renameTarget, setRenameTarget] = useState<DocumentRow | null>(null);
  const [newName, setNewName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data as DocumentRow[];
    },
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: DocumentRow) => {
      const { error: storageError } = await supabase.storage
        .from("medical-documents")
        .remove([doc.file_path]);
      if (storageError) throw storageError;
      const { error: dbError } = await supabase.from("documents").delete().eq("id", doc.id);
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Document deleted successfully" });
      setDeleteTarget(null);
    },
    onError: () => {
      toast({ title: "Unable to delete document", description: "Please try again.", variant: "destructive" });
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      const { error } = await supabase.from("documents").update({ file_name: newName }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      toast({ title: "Document name updated successfully" });
      setRenameTarget(null);
    },
    onError: () => {
      toast({ title: "Failed to rename document", description: "Please try again.", variant: "destructive" });
    },
  });

  const handleUpload = useCallback(async (files: FileList | File[]) => {
    if (!user) return;

    if (documents.length >= MAX_DOCUMENTS) {
      toast({ title: "Upload limit reached", description: `Maximum ${MAX_DOCUMENTS} documents allowed. Delete old ones first.`, variant: "destructive" });
      return;
    }

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Unsupported format", description: "Only PDF, JPG, PNG allowed.", variant: "destructive" });
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast({ title: "File too large", description: "File size must be under 5MB.", variant: "destructive" });
        continue;
      }
      if (documents.length + 1 > MAX_DOCUMENTS) {
        toast({ title: "Upload limit reached", description: `Maximum ${MAX_DOCUMENTS} documents.`, variant: "destructive" });
        break;
      }

      setUploading(true);
      try {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `${user.id}/${timestamp}_${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("medical-documents")
          .upload(filePath, file, { contentType: file.type });
        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from("documents").insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
        });
        if (dbError) throw dbError;

        toast({ title: "Document uploaded successfully" });
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      } catch {
        toast({ title: "Upload failed", description: "Please try again.", variant: "destructive" });
      } finally {
        setUploading(false);
      }
    }
  }, [user, queryClient, documents.length]);

  const handleDownload = async (doc: DocumentRow) => {
    const { data, error } = await supabase.storage
      .from("medical-documents")
      .createSignedUrl(doc.file_path, 60);
    if (error || !data?.signedUrl) {
      toast({ title: "File unavailable", description: "Please contact support.", variant: "destructive" });
      return;
    }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = doc.file_name;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const openRename = (doc: DocumentRow) => {
    setRenameTarget(doc);
    setNewName(doc.file_name.replace(/\.[^/.]+$/, ""));
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  };

  const filteredDocs = documents.filter(d =>
    !searchQuery || d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getExtension = (name: string) => {
    const parts = name.split(".");
    return parts.length > 1 ? `.${parts.pop()}` : "";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-up max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              📄 My Medical Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Securely upload and manage your health documents
            </p>
          </div>
          <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            {documents.length}/{MAX_DOCUMENTS} documents
          </div>
        </div>

        {/* Upload Zone */}
        <motion.div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
            dragOver
              ? "border-accent bg-accent/10 scale-[1.01]"
              : "border-border hover:border-accent/50 bg-muted/30"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : documents.length >= MAX_DOCUMENTS ? (
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle className="w-10 h-10 text-accent" />
              <p className="font-medium text-foreground">Upload limit reached</p>
              <p className="text-sm text-muted-foreground">Delete old documents to upload new ones</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-accent mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Drag & drop files here</p>
              <p className="text-sm text-muted-foreground mb-4">PDF, JPG, PNG • Max 5MB</p>
              <label>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => e.target.files && handleUpload(e.target.files)}
                />
                <Button variant="outline" className="cursor-pointer" asChild>
                  <span><Upload className="w-4 h-4 mr-2" />Upload Medical Report</span>
                </Button>
              </label>
            </>
          )}
        </motion.div>

        {/* Security Note */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-teal/10 border border-teal/20">
          <CheckCircle2 className="w-5 h-5 text-teal mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">🔒 Secure Storage:</strong> Your documents are encrypted and only accessible by you.
          </div>
        </div>

        {/* Search */}
        {documents.length > 0 && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name (Blood, Scan, Prescription...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Documents List */}
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
            Uploaded Documents ({filteredDocs.length})
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-2xl">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">No reports uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">Upload your medical reports to keep them organized</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-8 glass-card rounded-2xl">
              <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No documents match "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid gap-3">
              <AnimatePresence>
                {filteredDocs.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card rounded-xl p-4 flex items-center gap-4 group hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      {getFileIcon(doc.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{doc.file_name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploaded_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>•</span>
                        <span className="uppercase">{doc.file_type.split("/")[1]}</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => openRename(doc)} title="Rename">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDownload(doc)} title="Download">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(doc)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Rename Dialog */}
      {renameTarget && (
        <Dialog open={true} onOpenChange={() => setRenameTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Document</DialogTitle>
            </DialogHeader>
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Blood Test Report - Jan 2025"
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => renameMutation.mutate({
                  id: renameTarget.id,
                  newName: newName.trim() + getExtension(renameTarget.file_name)
                })}
                disabled={!newName.trim() || renameMutation.isPending}
              >
                {renameMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <AlertDialog open={true} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <strong>{deleteTarget.file_name}</strong>? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(deleteTarget)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DashboardLayout>
  );
};

export default Documents;