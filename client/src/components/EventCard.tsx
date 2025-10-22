import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Target, Plane } from "lucide-react";
import { format } from "date-fns";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  startTime: Date | string;
  endTime?: Date | string;
  location: string;
  planType: "FAIR" | "RAIN";
  isJoined?: boolean;
  onToggleRSVP: (eventId: string, joined: boolean) => void;
}

export default function EventCard({
  id,
  title,
  description,
  startTime,
  endTime,
  location,
  planType,
  isJoined = false,
  onToggleRSVP,
}: EventCardProps) {
  const [joined, setJoined] = useState(isJoined);

  const handleToggle = () => {
    const newState = !joined;
    setJoined(newState);
    onToggleRSVP(id, newState);
    console.log(`${newState ? "Joined" : "Left"} event:`, title);
  };

  // Helper function to format time - handles both Date objects and time strings
  const formatTime = (time: Date | string): string => {
    if (typeof time === 'string') {
      // Handle time strings like "14:00"
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const date = new Date();
          date.setHours(hours, minutes, 0, 0);
          return format(date, "h:mm a");
        }
      }
      // If string is not a valid time format, return as-is
      return time;
    }

    // Handle Date objects
    if (time instanceof Date && !isNaN(time.getTime())) {
      return format(time, "h:mm a");
    }

    // Fallback for invalid values
    return "Time TBD";
  };

  const timeRange = endTime
    ? `${formatTime(startTime)} - ${formatTime(endTime)}`
    : formatTime(startTime);

  return (
    <Card className="hover-elevate transition-transform border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="font-display uppercase text-xs">
                {planType === "FAIR" ? "☀️ Fair Weather" : "🌧️ Rain Plan"}
              </Badge>
            </div>
            <CardTitle className="font-display text-xl">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{timeRange}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{location}</span>
          </div>
        </div>

        <p className="text-sm text-card-foreground leading-relaxed">{description}</p>

        <Button
          data-testid={`button-rsvp-${id}`}
          onClick={handleToggle}
          variant={joined ? "default" : "outline"}
          className="w-full h-11 font-display uppercase tracking-wide"
        >
          {joined ? (
            <>
              <Target className="w-4 h-4 mr-2" />
              Target Locked
            </>
          ) : (
            <>
              <Plane className="w-4 h-4 mr-2" />
              Join Mission
            </>
          )}
        </Button>

        {joined && (
          <p className="text-xs text-center text-radar-green font-medium">
            🎯 You're cleared for this operation!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
