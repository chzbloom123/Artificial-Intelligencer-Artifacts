import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Article, Persona } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

const articleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  excerpt: z.string().optional(),
  topic: z.string().optional(),
  category: z.string().optional(),
  style: z.string().optional(),
  tags: z.string().optional(),
  isPublic: z.boolean().default(false),
  publishedAt: z.string().optional(),
  personaId: z.string().min(1, "Persona is required"),
});

type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  article?: Article;
  onSuccess: () => void;
}

export function ArticleForm({ article, onSuccess }: ArticleFormProps) {
  const { authHeaders } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(article?.featuredImageUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: personas } = useQuery({
    queryKey: ["admin-personas"],
    queryFn: () => api.get<Persona[]>("/api/personas/admin/all", authHeaders()),
  });

  // Parse tags from JSON string to comma-separated
  const initialTags = (() => {
    if (!article?.tags) return "";
    try {
      const arr = JSON.parse(article.tags) as string[];
      return arr.join(", ");
    } catch {
      return article.tags;
    }
  })();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title ?? "",
      body: article?.body ?? "",
      excerpt: article?.excerpt ?? "",
      topic: article?.topic ?? "",
      category: article?.category ?? "",
      style: article?.style ?? "",
      tags: initialTags,
      isPublic: article?.isPublic ?? false,
      publishedAt: article?.publishedAt
        ? new Date(article.publishedAt).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      personaId: article?.personaId ?? "",
    },
  });

  const isPublic = watch("isPublic");
  const bodyValue = watch("body");

  const handleBodyBlur = () => {
    const excerpt = watch("excerpt");
    if (!excerpt && bodyValue) {
      setValue("excerpt", bodyValue.slice(0, 200).trim());
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.upload<{ url: string }>("/api/upload", formData, authHeaders());
      setImageUrl(res.url);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    try {
      // Convert comma-separated tags to JSON array
      const tagsArray = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        ...data,
        tags: tagsArray,
        featuredImageUrl: imageUrl,
        publishedAt: data.publishedAt || undefined,
        topic: data.topic || undefined,
        category: data.category || undefined,
        style: data.style || undefined,
      };

      if (article) {
        await api.put(`/api/articles/${article.id}`, payload, authHeaders());
        toast({ title: "Article updated" });
      } else {
        await api.post("/api/articles", payload, authHeaders());
        toast({ title: "Article created" });
      }
      onSuccess();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="title" className="font-mono text-xs uppercase tracking-wider">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input id="title" {...register("title")} className="font-display text-base" />
        {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
      </div>

      {/* Persona */}
      <div className="space-y-1.5">
        <Label className="font-mono text-xs uppercase tracking-wider">
          Persona <span className="text-destructive">*</span>
        </Label>
        <Select
          defaultValue={article?.personaId ?? ""}
          onValueChange={(val) => setValue("personaId", val)}
        >
          <SelectTrigger className="font-mono text-sm">
            <SelectValue placeholder="Select persona..." />
          </SelectTrigger>
          <SelectContent>
            {personas?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({p.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.personaId ? <p className="text-xs text-destructive">{errors.personaId.message}</p> : null}
      </div>

      {/* Topic */}
      <div className="space-y-1.5">
        <Label htmlFor="topic" className="font-mono text-xs uppercase tracking-wider">
          Topic <span className="text-muted-foreground text-[10px]">(used for search & filtering)</span>
        </Label>
        <Input id="topic" {...register("topic")} className="font-mono text-sm" placeholder="e.g. Climate, Economy, AI Policy" />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <Label htmlFor="body" className="font-mono text-xs uppercase tracking-wider">
          Body <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="body"
          {...register("body")}
          onBlur={handleBodyBlur}
          rows={10}
          className="font-body text-base resize-y"
          placeholder="Article body text. Use double newlines for paragraphs..."
        />
        {errors.body ? <p className="text-xs text-destructive">{errors.body.message}</p> : null}
      </div>

      {/* Excerpt */}
      <div className="space-y-1.5">
        <Label htmlFor="excerpt" className="font-mono text-xs uppercase tracking-wider">
          Excerpt <span className="text-muted-foreground text-[10px]">(auto-generated if empty)</span>
        </Label>
        <Textarea
          id="excerpt"
          {...register("excerpt")}
          rows={3}
          className="font-body resize-none"
        />
      </div>

      {/* Featured image */}
      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">Featured Image</Label>
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <div className="relative">
              <img src={imageUrl} alt="Preview" className="w-20 h-14 object-cover rounded border border-border" />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-14 bg-muted rounded border border-border flex items-center justify-center">
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="font-mono text-xs"
          >
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      {/* Category + Style */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="category" className="font-mono text-xs uppercase tracking-wider">Category</Label>
          <Input id="category" {...register("category")} className="font-mono text-sm" placeholder="e.g. Technology" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="style" className="font-mono text-xs uppercase tracking-wider">Style</Label>
          <Input id="style" {...register("style")} className="font-mono text-sm" placeholder="e.g. investigative" />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-1.5">
        <Label htmlFor="tags" className="font-mono text-xs uppercase tracking-wider">
          Tags <span className="text-muted-foreground text-[10px]">(comma-separated)</span>
        </Label>
        <Input id="tags" {...register("tags")} className="font-mono text-sm" placeholder="AI, Technology, Opinion" />
      </div>

      {/* Published at */}
      <div className="space-y-1.5">
        <Label htmlFor="publishedAt" className="font-mono text-xs uppercase tracking-wider">Publish Date</Label>
        <Input
          id="publishedAt"
          type="datetime-local"
          {...register("publishedAt")}
          className="font-mono text-sm"
        />
      </div>

      {/* Public toggle */}
      <div className="flex items-center gap-3">
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={(val) => setValue("isPublic", val)}
        />
        <Label htmlFor="isPublic" className="font-mono text-xs uppercase tracking-wider">
          Public (visible on site)
        </Label>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full font-mono text-xs uppercase tracking-wider"
      >
        {isSubmitting ? "Saving..." : article ? "Update Article" : "Create Article"}
      </Button>
    </form>
  );
}
