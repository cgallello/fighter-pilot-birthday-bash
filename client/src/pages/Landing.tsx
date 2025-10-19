import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import RegistrationForm from "@/components/RegistrationForm";
import ScheduleColumns from "@/components/ScheduleColumns";
import MissionBioEditor from "@/components/MissionBioEditor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plane } from "lucide-react";

export default function Landing() {
  const [guestData, setGuestData] = useState<any>(null);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());

  //todo: remove mock functionality
  const mockFairEvents = [
    {
      id: "fair-1",
      title: "Pre-Flight Briefing",
      description: "Mission objectives and safety protocols. All pilots must attend this crucial briefing.",
      startTime: new Date("2025-03-15T14:00:00"),
      endTime: new Date("2025-03-15T15:00:00"),
      location: "Command Center, 123 Squadron Ave",
      planType: "FAIR" as const,
      sortOrder: 1,
    },
    {
      id: "fair-2",
      title: "Outdoor Flight Exercises",
      description: "Tactical maneuvers and formation flying in perfect weather conditions.",
      startTime: new Date("2025-03-15T15:30:00"),
      endTime: new Date("2025-03-15T17:00:00"),
      location: "Airfield Training Ground, Runway 7",
      planType: "FAIR" as const,
      sortOrder: 2,
    },
    {
      id: "fair-3",
      title: "Victory Celebration",
      description: "Cake cutting ceremony and awards for outstanding pilots!",
      startTime: new Date("2025-03-15T17:30:00"),
      endTime: new Date("2025-03-15T19:00:00"),
      location: "Officers' Club, Building 35",
      planType: "FAIR" as const,
      sortOrder: 3,
    },
  ];

  const mockRainEvents = [
    {
      id: "rain-1",
      title: "Indoor Simulator Training",
      description: "State-of-the-art flight simulation with weather effects and tactical scenarios.",
      startTime: new Date("2025-03-15T14:00:00"),
      endTime: new Date("2025-03-15T16:00:00"),
      location: "Hangar 5, Simulator Bay",
      planType: "RAIN" as const,
      sortOrder: 1,
    },
    {
      id: "rain-2",
      title: "Strategic Planning Workshop",
      description: "Learn advanced mission planning techniques from our best commanders.",
      startTime: new Date("2025-03-15T16:30:00"),
      endTime: new Date("2025-03-15T17:30:00"),
      location: "Conference Room Alpha, HQ Building",
      planType: "RAIN" as const,
      sortOrder: 2,
    },
    {
      id: "rain-3",
      title: "Victory Celebration (Indoor)",
      description: "Cake cutting ceremony and awards in our climate-controlled hangar!",
      startTime: new Date("2025-03-15T18:00:00"),
      endTime: new Date("2025-03-15T19:30:00"),
      location: "Hangar 35, Main Floor",
      planType: "RAIN" as const,
      sortOrder: 3,
    },
  ];

  const handleRegister = (data: any) => {
    console.log("Guest registered:", data);
    setGuestData(data);
  };

  const handleToggleRSVP = (eventId: string, joined: boolean) => {
    setRsvps((prev) => {
      const newSet = new Set(prev);
      if (joined) {
        newSet.add(eventId);
      } else {
        newSet.delete(eventId);
      }
      return newSet;
    });
  };

  const isRegistered = !!guestData;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl uppercase tracking-wide">
              Operation: 35
            </span>
          </div>
          <a
            href="/admin"
            data-testid="link-admin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Command Center
          </a>
        </div>
      </header>

      {/* Hero */}
      <HeroSection
        title="OPERATION: THIRTY-FIVE"
        description="Mission Briefing: You are cleared for the ultimate birthday celebration. Confirm your deployment slot and prepare for tactical fun at 35,000 feet of awesome!"
      />

      {/* Main Content - Registration + Schedule Combined */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl uppercase tracking-wide mb-3">
              Mission Schedule & RSVP
            </h2>
            <p className="text-muted-foreground text-lg">
              Register and choose your operations based on weather conditions
            </p>
          </div>

          <div className="grid lg:grid-cols-[320px_1fr] gap-8">
            {/* Left: Registration Form (Sticky) */}
            <div className="lg:sticky lg:top-24 self-start">
              <RegistrationForm onRegister={handleRegister} />
              
              {isRegistered && rsvps.size > 0 && (
                <div className="mt-6 p-6 bg-primary/5 border-2 border-primary rounded-lg">
                  <h3 className="font-display font-bold text-lg uppercase tracking-wide mb-2 text-center">
                    Deployment Status
                  </h3>
                  <p className="text-center mb-4">
                    <span className="font-bold text-primary text-3xl">{rsvps.size}</span>{" "}
                    {rsvps.size === 1 ? "mission" : "missions"}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        data-testid="button-edit-mission-bio"
                        variant="outline"
                        size="sm"
                        className="w-full font-display uppercase tracking-wide"
                      >
                        Edit Mission Bio
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <MissionBioEditor
                        phone={guestData?.phone}
                        onSave={(bio) => console.log("Bio saved:", bio)}
                        onRequestCode={(phone) => console.log("Code requested:", phone)}
                        onVerifyCode={(code) => console.log("Code verified:", code)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>

            {/* Right: Schedule */}
            <div>
              <ScheduleColumns
                fairEvents={mockFairEvents}
                rainEvents={mockRainEvents}
                userRSVPs={rsvps}
                onToggleRSVP={handleToggleRSVP}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-jet-gray text-cloud-white">
        <div className="container mx-auto text-center">
          <p className="font-display uppercase tracking-wide">
            Operation: Thirty-Five - Classified Mission
          </p>
          <p className="text-sm text-cloud-white/70 mt-2">
            All pilots report for duty on time
          </p>
        </div>
      </footer>
    </div>
  );
}
