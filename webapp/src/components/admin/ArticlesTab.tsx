import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Article } from "@/lib/types";
import { ArticleForm } from "./ArticleForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ArticlesTab() {
  const { authHeaders } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);

  const { data: articles, isLoading } = useQuery({
    queryKey: ["admin-articles"],
    queryFn: () => api.get<Article[]>("/api/articles/admin/all", authHeaders()),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/articles/${id}`, authHeaders()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast({ title: "Article deleted" });
      setDeleteArticle(null);
    },
    onError: (err) => {
      toast({
        title: "Error deleting article",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
      setDeleteArticle(null);
    },
  });

  const openCreate = () => {
    setEditingArticle(null);
    setDialogOpen(true);
  };

  const openEdit = (article: Article) => {
    setEditingArticle(article);
    setDialogOpen(true);
  };

  const onFormSuccess = () => {
    setDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    queryClient.invalidateQueries({ queryKey: ["articles"] });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold">Articles</h2>
        <Button onClick={openCreate} size="sm" className="font-mono text-xs uppercase tracking-wider gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Create Article
        </Button>
      </div>

      {!articles || articles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-sm">
          <p className="font-mono text-sm text-muted-foreground">No articles yet. Write your first piece.</p>
        </div>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="text-left px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Persona</th>
                <th className="text-left px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Published</th>
                <th className="text-left px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="text-right px-4 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium line-clamp-1 max-w-[200px] block">{article.title}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="font-mono text-xs text-muted-foreground">
                      {article.persona?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {article.category ? (
                      <span className="font-mono text-xs text-muted-foreground">{article.category}</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">
                    {formatDate(article.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    {article.isPublic ? (
                      <Badge className="bg-green-600/20 text-green-600 border-green-600/30 font-mono text-xs rounded-sm">Public</Badge>
                    ) : (
                      <Badge variant="secondary" className="font-mono text-xs rounded-sm">Draft</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(article)}
                        className="h-7 w-7 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteArticle(article)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingArticle ? "Edit Article" : "Create Article"}
            </DialogTitle>
          </DialogHeader>
          <ArticleForm article={editingArticle ?? undefined} onSuccess={onFormSuccess} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteArticle} onOpenChange={(open) => { if (!open) setDeleteArticle(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "<strong>{deleteArticle?.title}</strong>"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteArticle && deleteMutation.mutate(deleteArticle.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
