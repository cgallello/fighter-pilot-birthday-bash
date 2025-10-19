import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";

interface RegistrationFormProps {
  onRegister: (data: { name: string; email: string; phone: string }) => void;
}

export default function RegistrationForm({ onRegister }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration submitted:", formData);
    onRegister(formData);
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="font-display text-3xl uppercase tracking-wide">
          Enlist Now
        </CardTitle>
        <CardDescription className="text-base">
          Join the pilot roster for Operation: Thirty-Five
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium uppercase tracking-wide">
              Callsign (Name)
            </Label>
            <Input
              id="name"
              data-testid="input-name"
              placeholder="Maverick"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium uppercase tracking-wide">
              Secure Comms (Email)
            </Label>
            <Input
              id="email"
              data-testid="input-email"
              type="email"
              placeholder="pilot@airforce.mil"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium uppercase tracking-wide">
              Scramble Line (Phone)
            </Label>
            <Input
              id="phone"
              data-testid="input-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">
              Required for mission updates and quick edits to your pilot profile
            </p>
          </div>

          <Button
            type="submit"
            data-testid="button-register"
            className="w-full h-12 text-base font-display uppercase tracking-wide"
          >
            Confirm Deployment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
