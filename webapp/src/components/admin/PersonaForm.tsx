import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Persona } from "@/lib/types";
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

const personaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
  role: z.enum(["agent", "assistant", "collaborator"]),
  displayOrder: z.coerce.number().int().default(0),
  moreInfoText: z.string().optional(),
  isActive: z.boolean().default(true),
});

type PersonaFormData = z.infer<typeof personaSchema>;

interface PersonaFormProps {
  persona?: Persona;
  onSuccess: () => void;
}

export function PersonaForm({ persona, onSuccess }: PersonaFormProps) {
  const { authHeaders } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(persona?.profileImageUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonaFormData>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      name: persona?.name ?? "",
      bio: persona?.bio ?? "",
      role: persona?.role ?? "agent",
      displayOrder: persona?.displayOrder ?? 0,
      moreInfoText: persona?.moreInfoText ?? "",
      isActive: persona?.isActive ?? true,
    },
  });

  const isActive = watch("isActive");

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

  const onSubmit = async (data: PersonaFormData) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, profileImageUrl: imageUrl ?? undefined };
      if (persona) {
        await api.put(`/api/personas/${persona.id}`, payload, authHeaders());
        toast({ title: "Persona updated" });
      } else {
        await api.post("/api/personas", payload, authHeaders());
        toast({ title: "Persona created" });
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
      {/* Profile image */}
      <div className="space-y-2">
        <Label className="font-mono text-xs uppercase tracking-wider">Profile Image</Label>
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <div className="relative">
              <img src={imageUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
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

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="font-mono text-xs uppercase tracking-wider">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input id="name" {...register("name")} className="font-mono" />
        {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio" className="font-mono text-xs uppercase tracking-wider">
          Bio <span className="text-destructive">*</span>
        </Label>
        <Textarea id="bio" {...register("bio")} rows={3} className="font-body resize-none" />
        {errors.bio ? <p className="text-xs text-destructive">{errors.bio.message}</p> : null}
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <Label className="font-mono text-xs uppercase tracking-wider">
          Role <span className="text-destructive">*</span>
        </Label>
        <Select
          defaultValue={persona?.role ?? "agent"}
          onValueChange={(val) => setValue("role", val as PersonaFormData["role"])}
        >
          <SelectTrigger className="font-mono text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="agent">Agent</SelectItem>
            <SelectItem value="assistant">Assistant</SelectItem>
            <SelectItem value="collaborator">Collaborator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Display order */}
      <div className="space-y-1.5">
        <Label htmlFor="displayOrder" className="font-mono text-xs uppercase tracking-wider">
          Display Order
        </Label>
        <Input
          id="displayOrder"
          type="number"
          {...register("displayOrder")}
          className="font-mono w-24"
        />
      </div>

      {/* More info */}
      <div className="space-y-1.5">
        <Label htmlFor="moreInfoText" className="font-mono text-xs uppercase tracking-wider">
          More Info
        </Label>
        <Textarea
          id="moreInfoText"
          {...register("moreInfoText")}
          rows={3}
          className="font-body resize-none"
          placeholder="Additional background shown on persona page..."
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={(val) => setValue("isActive", val)}
        />
        <Label htmlFor="isActive" className="font-mono text-xs uppercase tracking-wider">
          Active (visible on site)
        </Label>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full font-mono text-xs uppercase tracking-wider"
      >
        {isSubmitting ? "Saving..." : persona ? "Update Persona" : "Create Persona"}
      </Button>
    </form>
  );
}
