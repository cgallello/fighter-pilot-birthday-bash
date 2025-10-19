import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import HeroSection from "@/components/HeroSection";
import RegistrationForm from "@/components/RegistrationForm";
import ScheduleColumns from "@/components/ScheduleColumns";
import MissionBioEditor from "@/components/MissionBioEditor";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plane } from "lucide-react";

interface EventBlock {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime?: string;
  location: string;
  planType: "FAIR" | "RAIN";
  sortOrder: number;
}

interface Guest {
  id: string;
  name: string;
  phone: string;
  phoneVerified: boolean;
  description?: string | null;
}

interface Rsvp {
  id: string;
  guestId: string;
  eventBlockId: string;
  status: "JOINED" | "DECLINED";
}

interface Settings {
  eventTitle: string;
  eventDescription: string;
}

export default function Landing() {
  const [guestData, setGuestData] = useState<Guest | null>(null);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Fetch settings
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  // Fetch events
  const { data: eventsData, isLoading: eventsLoading } = useQuery<{
    fair: EventBlock[];
    rain: EventBlock[];
  }>({
    queryKey: ["/api/events"],
  });

  // Fetch guest RSVPs when guest is registered
  const { data: guestRsvps } = useQuery<Rsvp[]>({
    queryKey: ["/api/rsvp/guest", guestData?.id],
    enabled: !!guestData?.id,
  });

  // Update local RSVPs when data loads
  useEffect(() => {
    if (guestRsvps) {
      const rsvpSet = new Set(
        guestRsvps
          .filter((r) => r.status === "JOINED")
          .map((r) => r.eventBlockId)
      );
      setRsvps(rsvpSet);
    }
  }, [guestRsvps]);

  // Create guest mutation
  const createGuestMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }) => {
      const res = await apiRequest("POST", "/api/guests", data);
      return await res.json() as Guest;
    },
    onSuccess: async (guest: Guest) => {
      setGuestData(guest);
      
      // Create RSVPs for all selected events
      const selectedEvents = Array.from(rsvps);
      if (selectedEvents.length > 0) {
        await Promise.all(
          selectedEvents.map((eventId) =>
            apiRequest("POST", "/api/rsvp", {
              guestId: guest.id,
              eventBlockId: eventId,
              status: "JOINED",
            })
          )
        );
      }
      
      toast({
        title: "✅ Registration Complete",
        description: `Welcome to the squadron, pilot! ${selectedEvents.length} mission${selectedEvents.length === 1 ? '' : 's'} confirmed.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/rsvp/guest", guest.id] });
    },
    onError: () => {
      toast({
        title: "❌ Registration Failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // RSVP mutation
  const rsvpMutation = useMutation({
    mutationFn: async (data: { guestId: string; eventBlockId: string; status: "JOINED" | "DECLINED" }) => {
      const res = await apiRequest("POST", "/api/rsvp", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rsvp/guest", guestData?.id] });
    },
  });

  const handleRegister = (data: { name: string; phone: string }) => {
    createGuestMutation.mutate(data);
  };

  const handleToggleRSVP = (eventId: string, joined: boolean) => {
    const newSet = new Set(rsvps);
    if (joined) {
      newSet.add(eventId);
    } else {
      newSet.delete(eventId);
    }
    setRsvps(newSet);

    // If already registered, save RSVP immediately
    if (guestData) {
      rsvpMutation.mutate({
        guestId: guestData.id,
        eventBlockId: eventId,
        status: joined ? "JOINED" : "DECLINED",
      });
    }
  };

  const isRegistered = !!guestData;

  const fairEvents = eventsData?.fair.map(e => ({
    ...e,
    startTime: new Date(e.startTime),
    endTime: e.endTime ? new Date(e.endTime) : undefined,
  })) || [];

  const rainEvents = eventsData?.rain.map(e => ({
    ...e,
    startTime: new Date(e.startTime),
    endTime: e.endTime ? new Date(e.endTime) : undefined,
  })) || [];

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
        title={settings?.eventTitle || "OPERATION: THIRTY-FIVE"}
        description={
          settings?.eventDescription ||
          "Mission Briefing: You are cleared for the ultimate birthday celebration. Confirm your deployment slot and prepare for tactical fun at 35,000 feet of awesome!"
        }
      />

      {/* Schedule Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-4xl uppercase tracking-wide mb-3">
              Mission Schedule
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose your operations based on weather conditions
            </p>
          </div>

          {eventsLoading ? (
            <div className="text-center text-muted-foreground">Loading mission details...</div>
          ) : (
            <ScheduleColumns
              fairEvents={fairEvents}
              rainEvents={rainEvents}
              userRSVPs={rsvps}
              onToggleRSVP={handleToggleRSVP}
            />
          )}
        </div>
      </section>

      {/* Registration Section - Bottom */}
      <section className="py-16 px-4 bg-muted/30 border-t">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-4xl uppercase tracking-wide mb-3">
              Complete Your Registration
            </h2>
            <p className="text-muted-foreground text-lg">
              {rsvps.size > 0 
                ? `Enter your info to confirm ${rsvps.size} mission${rsvps.size === 1 ? '' : 's'}`
                : "Select missions above, then enter your info to confirm"}
            </p>
          </div>

          {/* Mission Count Display */}
          {!isRegistered && rsvps.size > 0 && (
            <div className="mb-8 max-w-md mx-auto p-6 bg-primary/10 border-2 border-primary rounded-lg">
              <h3 className="font-display font-bold text-lg uppercase tracking-wide mb-2 text-center">
                Missions Selected
              </h3>
              <p className="text-center">
                <span className="font-bold text-primary text-4xl" data-testid="text-mission-count">{rsvps.size}</span>{" "}
                {rsvps.size === 1 ? "mission" : "missions"} ready for confirmation
              </p>
            </div>
          )}

          <div className="max-w-md mx-auto">
            {isRegistered ? (
              <div className="bg-card border border-card-border rounded-lg p-6 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="font-display text-2xl uppercase tracking-wide mb-2">
                  You're Registered!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Callsign: <span className="font-bold">{guestData.name}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Scramble Line: {guestData.phone}
                </p>
              </div>
            ) : (
              <RegistrationForm onRegister={handleRegister} />
            )}
          </div>

          {isRegistered && rsvps.size > 0 && (
            <div className="mt-8 max-w-md mx-auto p-6 bg-primary/5 border-2 border-primary rounded-lg">
              <h3 className="font-display font-bold text-lg uppercase tracking-wide mb-2 text-center">
                Deployment Status
              </h3>
              <p className="text-center mb-4">
                <span className="font-bold text-primary text-3xl">{rsvps.size}</span>{" "}
                {rsvps.size === 1 ? "mission" : "missions"} confirmed
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
                    guestId={guestData.id}
                    currentBio={guestData.description}
                    phone={guestData.phone}
                    onBioSaved={() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/guests", guestData.id] });
                      toast({
                        title: "✅ Bio Updated",
                        description: "Your mission bio has been saved",
                      });
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
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
