import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post<{ token: string; email: string }>("/api/auth/login", {
        email,
        password,
      });
      login(res.token, res.email);
      navigate("/admin/dashboard");
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-sm">
        {/* Masthead */}
        <div className="text-center mb-8">
          <p className="font-mono text-xs tracking-widest uppercase text-neutral-500 mb-2">
            Editorial System
          </p>
          <h1
            className="font-display text-2xl font-bold tracking-wide"
            style={{ color: "#f8f6f0" }}
          >
            The Artificial Intelligencer
          </h1>
          <div className="flex items-center gap-2 mt-3 justify-center">
            <div className="h-px flex-1 bg-neutral-700" />
            <span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">Admin Access</span>
            <div className="h-px flex-1 bg-neutral-700" />
          </div>
        </div>

        <Card className="border-neutral-800 bg-neutral-900">
          <CardHeader className="pb-0" />
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-neutral-800 border-neutral-700 text-neutral-100 font-mono placeholder:text-neutral-600 focus:border-[#b85c38] focus:ring-[#b85c38]"
                  placeholder="editor@aier.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="font-mono text-xs uppercase tracking-wider text-neutral-400">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-neutral-800 border-neutral-700 text-neutral-100 font-mono placeholder:text-neutral-600 focus:border-[#b85c38] focus:ring-[#b85c38]"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full font-mono text-xs uppercase tracking-wider"
                style={{ backgroundColor: "#b85c38", color: "#f8f6f0" }}
              >
                {isLoading ? "Authenticating..." : "Enter Newsroom"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center font-mono text-xs text-neutral-600 mt-6">
          Unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
}
