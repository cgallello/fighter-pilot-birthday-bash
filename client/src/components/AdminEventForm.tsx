import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save } from "lucide-react";

interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  planType: "FAIR" | "RAIN";
}

interface AdminEventFormProps {
  initialData?: Partial<EventFormData>;
  onSave: (data: EventFormData) => void;
  onCancel?: () => void;
}

export default function AdminEventForm({ initialData, onSave, onCancel }: AdminEventFormProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    location: initialData?.location || "",
    planType: initialData?.planType || "FAIR",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Event saved:", formData);
    onSave(formData);
  };

  const isEditing = !!initialData?.title;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl uppercase tracking-wide flex items-center gap-2">
          {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isEditing ? "Edit Event Block" : "Create Event Block"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event-title" className="text-sm font-medium uppercase tracking-wide">
                Mission Title
              </Label>
              <Input
                id="event-title"
                data-testid="input-event-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Pre-Flight Briefing"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-type" className="text-sm font-medium uppercase tracking-wide">
                Plan Type
              </Label>
              <Select
                value={formData.planType}
                onValueChange={(value: "FAIR" | "RAIN") =>
                  setFormData({ ...formData, planType: value })
                }
              >
                <SelectTrigger id="plan-type" data-testid="select-plan-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FAIR">☀️ Fair Weather</SelectItem>
                  <SelectItem value="RAIN">🌧️ Rain Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description" className="text-sm font-medium uppercase tracking-wide">
              Description
            </Label>
            <Textarea
              id="event-description"
              data-testid="textarea-event-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mission objectives and details..."
              className="min-h-20 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-sm font-medium uppercase tracking-wide">
                Start Time
              </Label>
              <Input
                id="start-time"
                data-testid="input-start-time"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time" className="text-sm font-medium uppercase tracking-wide">
                End Time
              </Label>
              <Input
                id="end-time"
                data-testid="input-end-time"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium uppercase tracking-wide">
              Location
            </Label>
            <Input
              id="location"
              data-testid="input-location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Command Center, 123 Squadron Ave"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              data-testid="button-save-event"
              className="flex-1 font-display uppercase tracking-wide"
            >
              {isEditing ? "Update Event" : "Create Event"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                data-testid="button-cancel-event"
                onClick={onCancel}
                className="flex-1 font-display uppercase tracking-wide"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
