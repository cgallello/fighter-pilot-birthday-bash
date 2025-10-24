import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

interface RegistrationFormProps {
  onRegister: (data: { name: string; phone: string; plusOnes: number }) => void;
}

export default function RegistrationForm({ onRegister }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    plusOnes: "1", // Store as string to allow empty input
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate plusOnes is a number between 1-11
    const plusOnesNum = parseInt(formData.plusOnes);
    const validPlusOnes = !isNaN(plusOnesNum) && plusOnesNum >= 1 && plusOnesNum <= 11 ? plusOnesNum : 1;

    onRegister({
      ...formData,
      plusOnes: validPlusOnes,
    });
  };

  return (
    <div className="bg-card border border-card-border rounded-lg p-6 shadow-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-2 rounded-full">
          <UserPlus className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display text-xl uppercase tracking-wide">Your Info</h3>
          <p className="text-sm text-muted-foreground">Register to RSVP</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
            Required for mission updates and editing your profile
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="plusOnes" className="text-sm font-medium uppercase tracking-wide">
            Squadron Size
          </Label>
          <Input
            id="plusOnes"
            data-testid="input-plus-ones"
            type="text"
            placeholder="1"
            value={formData.plusOnes}
            onChange={(e) => setFormData({ ...formData, plusOnes: e.target.value })}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Total number of pilots in your squadron (1-11)
          </p>
        </div>

        <Button
          type="submit"
          data-testid="button-register"
          className="w-full h-11 text-base font-display uppercase tracking-wide"
        >
          Save & Continue
        </Button>
      </form>
    </div>
  );
}
