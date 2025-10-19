import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Save } from "lucide-react";

interface SettingsData {
  eventTitle: string;
  eventDescription: string;
}

interface AdminSettingsFormProps {
  initialData: SettingsData;
  onSave: (data: SettingsData) => void;
}

export default function AdminSettingsForm({ initialData, onSave }: AdminSettingsFormProps) {
  const [formData, setFormData] = useState<SettingsData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Settings saved:", formData);
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-2xl uppercase tracking-wide flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Event Settings
        </CardTitle>
        <CardDescription>Configure the main event details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="event-title" className="text-sm font-medium uppercase tracking-wide">
              Event Title
            </Label>
            <Input
              id="event-title"
              data-testid="input-event-title-settings"
              value={formData.eventTitle}
              onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
              placeholder="OPERATION: THIRTY-FIVE"
              className="font-display text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description" className="text-sm font-medium uppercase tracking-wide">
              Event Description
            </Label>
            <Textarea
              id="event-description"
              data-testid="textarea-event-description-settings"
              value={formData.eventDescription}
              onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
              placeholder="Mission Briefing: You are cleared for the ultimate birthday celebration..."
              className="min-h-32 resize-none"
              required
            />
          </div>

          <Button
            type="submit"
            data-testid="button-save-settings"
            className="w-full h-11 font-display uppercase tracking-wide"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
