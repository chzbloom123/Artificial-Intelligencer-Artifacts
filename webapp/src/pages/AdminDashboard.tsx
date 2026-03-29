import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { PersonasTab } from "@/components/admin/PersonasTab";
import { ArticlesTab } from "@/components/admin/ArticlesTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, ExternalLink } from "lucide-react";

export default function AdminDashboard() {
  const { email, logout } = useAuth();

  return (
    <div className="min-h-screen dark bg-background text-foreground">
      {/* Admin top bar */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hidden sm:block hover:text-foreground transition-colors">
              The Artificial Intelligencer
            </Link>
            <span className="font-mono text-xs text-muted-foreground hidden sm:block">&mdash;</span>
            <span className="font-mono text-xs uppercase tracking-wider" style={{ color: "#b85c38" }}>
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Link to="/" target="_blank">
              <Button variant="ghost" size="sm" className="font-mono text-xs gap-1.5 h-7 text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:block">View Site</span>
              </Button>
            </Link>
            {email ? (
              <span className="font-mono text-xs text-muted-foreground hidden md:block truncate max-w-[180px]">
                {email}
              </span>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="font-mono text-xs gap-1.5 h-7 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-3 w-3" />
              <span className="hidden sm:block">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Tabs defaultValue="personas">
          <TabsList className="font-mono text-xs uppercase tracking-wider mb-6 h-9">
            <TabsTrigger value="personas" className="text-xs tracking-wider">Personas</TabsTrigger>
            <TabsTrigger value="articles" className="text-xs tracking-wider">Articles</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs tracking-wider">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="personas" className="mt-0">
            <PersonasTab />
          </TabsContent>

          <TabsContent value="articles" className="mt-0">
            <ArticlesTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
