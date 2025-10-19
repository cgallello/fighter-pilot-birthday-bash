import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield } from "lucide-react";

interface AdminLoginProps {
  onLogin: (password: string) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Admin login attempted");
    onLogin(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cockpit-dark via-jet-gray to-cockpit-dark p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Shield className="w-12 h-12 text-primary" />
            </div>
          </div>
          <CardTitle className="font-display text-3xl uppercase tracking-wide">
            Command Center
          </CardTitle>
          <CardDescription>
            Restricted Access - Command Staff Only
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-sm font-medium uppercase tracking-wide">
                Authorization Code
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  data-testid="input-admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              data-testid="button-admin-login"
              className="w-full h-12 text-base font-display uppercase tracking-wide"
            >
              Access Command Center
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
