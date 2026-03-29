import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { SiteSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

export function SettingsTab() {
  const { authHeaders } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<SiteSettings>("/api/settings"),
  });

  const [siteName, setSiteName] = useState("");
  const [tagline, setTagline] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName);
      setTagline(settings.tagline);
      setIsPublic(settings.isPublic);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: { siteName: string; tagline: string; isPublic: boolean }) =>
      api.put("/api/settings", data, authHeaders()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast({ title: "Settings saved" });
    },
    onError: (err) => {
      toast({
        title: "Error saving settings",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-md space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl font-semibold mb-6">Site Settings</h2>

      <div className="space-y-5">
        {/* Site name */}
        <div className="space-y-1.5">
          <Label htmlFor="siteName" className="font-mono text-xs uppercase tracking-wider">
            Site Name
          </Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="font-display text-base"
          />
        </div>

        {/* Tagline */}
        <div className="space-y-1.5">
          <Label htmlFor="tagline" className="font-mono text-xs uppercase tracking-wider">
            Tagline
          </Label>
          <Input
            id="tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="font-body text-base"
          />
        </div>

        {/* Public toggle */}
        <div className="space-y-2 p-4 border border-border rounded-sm">
          <div className="flex items-center gap-3">
            <Switch
              id="isPublic"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="isPublic" className="font-mono text-xs uppercase tracking-wider">
              Site is Public
            </Label>
          </div>
          {!isPublic ? (
            <div className="flex items-start gap-2 mt-2 p-2 rounded bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                The site is currently offline. Visitors will see an "Under Maintenance" page.
              </p>
            </div>
          ) : null}
        </div>

        <Button
          onClick={() => updateMutation.mutate({ siteName, tagline, isPublic })}
          disabled={updateMutation.isPending}
          className="w-full font-mono text-xs uppercase tracking-wider"
        >
          {updateMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
