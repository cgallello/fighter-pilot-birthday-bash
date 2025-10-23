import { useState } from "react";
import EventCard from "./EventCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, CloudRain } from "lucide-react";

interface EventBlock {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime?: Date;
  location: string;
  planType: "FAIR" | "RAIN";
  sortOrder: number;
  rsvps?: Array<{
    guestName: string;
    plusOnes: number;
  }>;
}

interface ScheduleColumnsProps {
  fairEvents: EventBlock[];
  rainEvents: EventBlock[];
  userRSVPs?: Set<string>;
  onToggleRSVP: (eventId: string, joined: boolean) => void;
}

export default function ScheduleColumns({
  fairEvents,
  rainEvents,
  userRSVPs = new Set(),
  onToggleRSVP,
}: ScheduleColumnsProps) {
  const [activeTab, setActiveTab] = useState<string>("fair");

  return (
    <div className="w-full">
      {/* Desktop: Side by side */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b-2 border-sky-blue">
            <h2 className="font-display text-3xl font-bold text-center uppercase tracking-wide flex items-center justify-center gap-3">
              <Sun className="w-8 h-8 text-warning-yellow" />
              Fair Weather Ops
              <Sun className="w-8 h-8 text-warning-yellow" />
            </h2>
          </div>
          <div className="space-y-4">
            {fairEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                isJoined={userRSVPs.has(event.id)}
                onToggleRSVP={onToggleRSVP}
                rsvps={event.rsvps}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b-2 border-sky-blue">
            <h2 className="font-display text-3xl font-bold text-center uppercase tracking-wide flex items-center justify-center gap-3">
              <CloudRain className="w-8 h-8 text-sky-blue" />
              Rain Contingency
              <CloudRain className="w-8 h-8 text-sky-blue" />
            </h2>
          </div>
          <div className="space-y-4">
            {rainEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                isJoined={userRSVPs.has(event.id)}
                onToggleRSVP={onToggleRSVP}
                rsvps={event.rsvps}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Tabs */}
      <div className="lg:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 h-14">
            <TabsTrigger
              value="fair"
              data-testid="tab-fair-weather"
              className="font-display uppercase text-sm"
            >
              <Sun className="w-4 h-4 mr-2" />
              Fair Weather
            </TabsTrigger>
            <TabsTrigger
              value="rain"
              data-testid="tab-rain-plan"
              className="font-display uppercase text-sm"
            >
              <CloudRain className="w-4 h-4 mr-2" />
              Rain Plan
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fair" className="space-y-4 mt-6">
            {fairEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                isJoined={userRSVPs.has(event.id)}
                onToggleRSVP={onToggleRSVP}
                rsvps={event.rsvps}
              />
            ))}
          </TabsContent>

          <TabsContent value="rain" className="space-y-4 mt-6">
            {rainEvents.map((event) => (
              <EventCard
                key={event.id}
                {...event}
                isJoined={userRSVPs.has(event.id)}
                onToggleRSVP={onToggleRSVP}
                rsvps={event.rsvps}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
