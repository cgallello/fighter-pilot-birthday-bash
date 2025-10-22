import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import HeroSection from "@/components/HeroSection";
import RegistrationForm from "@/components/RegistrationForm";
import ScheduleColumns from "@/components/ScheduleColumns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plane, Edit3 } from "lucide-react";

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
  plusOnes: number;
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

// Auth storage helpers
const STORAGE_KEY = "fighter-pilot-auth";

interface StoredAuth {
  guestId: string;
  editToken: string;
  expiresAt: number;
  guestInfo: {
    name: string;
    phone: string;
    description?: string;
    plusOnes?: number;
  };
}

function getStoredAuth(): StoredAuth | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const auth = JSON.parse(stored) as StoredAuth;

    // Check if expired (1 year)
    if (Date.now() > auth.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return auth;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function storeAuth(guestId: string, editToken: string, guestInfo: { name: string; phone: string; description?: string; plusOnes?: number }) {
  const auth: StoredAuth = {
    guestId,
    editToken,
    expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
    guestInfo,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export default function Landing() {
  const [guestData, setGuestData] = useState<Guest | null>(null);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState({ name: "", phone: "", plusOnes: 1 });
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

  // Check for existing session on mount
  useEffect(() => {
    const verifySession = async () => {
      const storedAuth = getStoredAuth();
      if (storedAuth) {
        try {
          const res = await apiRequest("POST", "/api/auth/verify-session", {}, {
            headers: {
              Authorization: `Bearer ${storedAuth.editToken}`
            }
          });

          if (res.ok) {
            const data = await res.json();
            setGuestData({
              id: data.guest.id,
              name: data.guest.name,
              phone: data.guest.phone,
              phoneVerified: true,
              description: data.guest.description,
              plusOnes: data.guest.plusOnes || 1
            });

            // Set RSVPs from server data
            const rsvpSet = new Set(data.rsvps.map((r: any) => r.eventBlockId));
            setRsvps(rsvpSet);
          } else {
            // Invalid session, clear stored auth
            clearStoredAuth();
          }
        } catch (error) {
          console.error("Session verification failed:", error);
          clearStoredAuth();
        }
      }
      setIsLoadingSession(false);
    };

    verifySession();
  }, []);

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
    mutationFn: async (data: { name: string; phone: string; plusOnes: number }) => {
      const res = await apiRequest("POST", "/api/guests", data);
      return await res.json() as Guest & { editToken: string };
    },
    onSuccess: async (response: Guest & { editToken: string }) => {
      const { editToken, ...guest } = response;
      setGuestData(guest);

      // Store auth data in localStorage
      storeAuth(guest.id, editToken, {
        name: guest.name,
        phone: guest.phone,
        description: guest.description || undefined,
        plusOnes: guest.plusOnes || 1
      });

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

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await apiRequest("POST", "/api/auth/phone-login", { phone });
      return await res.json();
    },
    onSuccess: async (response) => {
      const { editToken, guest } = response;
      setGuestData(guest);

      // Store auth data in localStorage
      storeAuth(guest.id, editToken, {
        name: guest.name,
        phone: guest.phone,
        description: guest.description || undefined,
        plusOnes: guest.plusOnes || 1
      });

      setLoginDialogOpen(false);
      setLoginPhone("");

      toast({
        title: "🛩️ Pilot Authenticated!",
        description: `Welcome back, ${guest.name}! Ready for your next mission.`,
      });

      // Reload page to ensure all mission selections are properly displayed
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "🚫 Authentication Failed",
        description: error.message.includes("404")
          ? "No pilot registration found for this callsign. Please register first!"
          : "Authentication system malfunction. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; phone?: string; plusOnes?: number }) => {
      console.log("[UPDATE PROFILE] Starting request with data:", data);

      const storedAuth = getStoredAuth();
      console.log("[UPDATE PROFILE] Stored auth:", storedAuth ? "Found" : "Not found");
      if (!storedAuth) throw new Error("No auth token");

      console.log("[UPDATE PROFILE] Making API request to /api/auth/update-profile");
      const res = await apiRequest("POST", "/api/auth/update-profile", data, {
        headers: {
          Authorization: `Bearer ${storedAuth.editToken}`
        }
      });

      console.log("[UPDATE PROFILE] Response status:", res.status, res.statusText);
      console.log("[UPDATE PROFILE] Response headers:", Object.fromEntries(res.headers.entries()));

      const responseText = await res.text();
      console.log("[UPDATE PROFILE] Raw response text:", responseText);

      try {
        const responseData = JSON.parse(responseText);
        console.log("[UPDATE PROFILE] Parsed response data:", responseData);
        return responseData;
      } catch (parseError) {
        console.error("[UPDATE PROFILE] JSON parse error:", parseError);
        console.error("[UPDATE PROFILE] Response was:", responseText);
        throw new Error(`Failed to parse response: ${responseText.substring(0, 200)}`);
      }
    },
    onSuccess: (response) => {
      setGuestData({
        ...guestData!,
        name: response.guest.name,
        phone: response.guest.phone,
        plusOnes: response.guest.plusOnes
      });

      // Update localStorage
      const storedAuth = getStoredAuth();
      if (storedAuth) {
        storeAuth(storedAuth.guestId, storedAuth.editToken, {
          name: response.guest.name,
          phone: response.guest.phone,
          description: response.guest.description || guestData!.description,
          plusOnes: response.guest.plusOnes
        });
      }

      setEditDialogOpen(false);
      toast({
        title: "✅ Profile Updated",
        description: "Your pilot information has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRegister = (data: { name: string; phone: string; plusOnes: number }) => {
    createGuestMutation.mutate(data);
  };

  const handleEditProfile = () => {
    if (guestData) {
      setEditData({ name: guestData.name, phone: guestData.phone, plusOnes: guestData.plusOnes });
      setEditDialogOpen(true);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(editData);
  };

  const handleToggleRSVP = (eventId: string, joined: boolean) => {
    const newSet = new Set(rsvps);
    if (joined) {
      newSet.add(eventId);
    } else {
      newSet.delete(eventId);
    }
    setRsvps(newSet);

    // If already registered, save RSVP immediately and show toast
    if (guestData) {
      // Find the event title for the toast
      const allEvents = [...(fairEvents || []), ...(rainEvents || [])];
      const event = allEvents.find(e => e.id === eventId);
      const eventTitle = event?.title || "Mission";

      rsvpMutation.mutate({
        guestId: guestData.id,
        eventBlockId: eventId,
        status: joined ? "JOINED" : "DECLINED",
      });

      // Show toast notification
      toast({
        title: joined ? "🎯 Mission Joined!" : "🚫 Mission Cancelled",
        description: joined
          ? `You're now signed up for "${eventTitle}"`
          : `You've been removed from "${eventTitle}"`,
        duration: 3000,
      });
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setGuestData(null);
    setRsvps(new Set());

    // Clear all React Query cache to ensure UI updates immediately
    queryClient.clear();

    toast({
      title: "✈️ Mission Complete",
      description: "You have been cleared from the tower. Fly safe, pilot!",
    });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPhone.trim()) {
      loginMutation.mutate(loginPhone.trim());
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
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <span className="font-display font-bold text-lg sm:text-xl uppercase tracking-wide">
              Operation: 35
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isRegistered ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs sm:text-sm font-display uppercase tracking-wide"
              >
                RTB - Logout
              </Button>
            ) : (
              <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm font-display uppercase tracking-wide"
                  >
                    🛩️ Scramble In!
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display uppercase tracking-wide text-center">
                      Pilot Authentication
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                      Enter your registered phone number to access your profile
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-phone" className="font-display uppercase tracking-wide text-sm">
                        Enter Your Callsign (Phone Number)
                      </Label>
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        required
                        className="text-center"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Use the same number you registered with
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full font-display uppercase tracking-wide"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "🔄 Authenticating..." : "✈️ Clear for Takeoff!"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <a
              href="/admin"
              data-testid="link-admin"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Command Center
            </a>
          </div>
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

          {eventsLoading || isLoadingSession ? (
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
              {isRegistered ? "Mission Status" : "Complete Your Registration"}
            </h2>
            <p className="text-muted-foreground text-lg">
              {isRegistered
                ? "Your registration is confirmed. Modify your details or mission selection as needed."
                : rsvps.size > 0
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
                <p className="text-muted-foreground mb-2">
                  Callsign: <span className="font-bold">{guestData.name}</span>
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Scramble Line: {guestData.phone}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Squadron Size: <span className="font-bold">{guestData.plusOnes}</span> pilot{guestData.plusOnes === 1 ? '' : 's'}
                </p>

                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditProfile}
                      className="text-sm font-display uppercase tracking-wide"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      ✏️ Edit Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-display uppercase tracking-wide text-center">
                        Update Pilot Info
                      </DialogTitle>
                      <DialogDescription className="text-center text-muted-foreground">
                        Update your callsign, contact information and squadron size
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name" className="font-display uppercase tracking-wide text-sm">
                          Callsign (Name)
                        </Label>
                        <Input
                          id="edit-name"
                          type="text"
                          placeholder="Maverick"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          required
                          className="text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-phone" className="font-display uppercase tracking-wide text-sm">
                          Scramble Line (Phone)
                        </Label>
                        <Input
                          id="edit-phone"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          required
                          className="text-center"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-plus-ones" className="font-display uppercase tracking-wide text-sm">
                          Squadron Size (+1s)
                        </Label>
                        <Input
                          id="edit-plus-ones"
                          type="number"
                          min="1"
                          max="11"
                          placeholder="1"
                          value={editData.plusOnes}
                          onChange={(e) => setEditData({ ...editData, plusOnes: parseInt(e.target.value) || 1 })}
                          className="text-center"
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          Total number of pilots in your squadron (1-11)
                        </p>
                      </div>
                      <Button
                        type="submit"
                        className="w-full font-display uppercase tracking-wide"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? "🔄 Updating..." : "💾 Save Changes"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <RegistrationForm onRegister={handleRegister} />
            )}
          </div>

          {isRegistered && (guestRsvps?.length || 0) > 0 && (
            <div className="mt-8 max-w-md mx-auto p-6 bg-primary/5 border-2 border-primary rounded-lg">
              <h3 className="font-display font-bold text-lg uppercase tracking-wide mb-2 text-center">
                Deployment Status
              </h3>
              <p className="text-center mb-4">
                <span className="font-bold text-primary text-3xl">{guestRsvps?.length || 0}</span>{" "}
                {(guestRsvps?.length || 0) === 1 ? "mission" : "missions"} confirmed
              </p>
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
