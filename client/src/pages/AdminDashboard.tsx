import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AdminLogin from "@/components/AdminLogin";
import AdminSettingsForm from "@/components/AdminSettingsForm";
import AdminEventForm from "@/components/AdminEventForm";
import AdminRosterView from "@/components/AdminRosterView";
import { Settings, Calendar, Users, Plus, Shield, LogOut } from "lucide-react";
import { useLocation } from "wouter";

interface EventBlock {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime?: string | null;
  location: string;
  planType: "FAIR" | "RAIN";
  sortOrder: number;
}

interface Rsvp {
  id: string;
  guestId: string;
  eventBlockId: string;
  status: "JOINED" | "DECLINED";
  guest?: {
    id: string;
    name: string;
    phone: string;
    description?: string | null;
    plusOnes: number;
  };
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");
  const [showEventForm, setShowEventForm] = useState(false);
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/session");
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Session check failed, stay logged out
      }
    };

    checkSession();
  }, []);

  // Fetch settings
  const { data: settings } = useQuery<{ eventTitle: string; eventDescription: string }>({
    queryKey: ["/api/settings"],
    enabled: isAuthenticated,
  });

  // Fetch events
  const { data: eventsData } = useQuery<{ fair: EventBlock[]; rain: EventBlock[] }>({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
  });

  // Fetch RSVPs
  const { data: rsvpsData } = useQuery<Rsvp[]>({
    queryKey: ["/api/admin/rsvps"],
    enabled: isAuthenticated,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await apiRequest("POST", "/api/admin/login", { password });
      return await res.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "✅ Access Granted",
        description: "Welcome to Command Center",
      });
    },
    onError: () => {
      toast({
        title: "❌ Access Denied",
        description: "Invalid authorization code",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/logout", {});
      return await res.json();
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      toast({
        title: "Logged Out",
        description: "Session terminated",
      });
      navigate("/");
    },
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: { eventTitle: string; eventDescription: string }) => {
      const res = await apiRequest("POST", "/api/settings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "✅ Settings Saved",
        description: "Event details updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "❌ Failed to Save",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const eventData = {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
      };
      const res = await apiRequest("POST", "/api/events", eventData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowEventForm(false);
      toast({
        title: "✅ Event Created",
        description: "New mission block added to schedule",
      });
    },
    onError: () => {
      toast({
        title: "❌ Failed to Create Event",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await apiRequest("DELETE", `/api/events/${eventId}`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "✅ Event Deleted",
        description: "Mission block removed from schedule",
      });
    },
    onError: () => {
      toast({
        title: "❌ Failed to Delete",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return <AdminLogin onLogin={(password) => loginMutation.mutate(password)} />;
  }

  const allEvents = [...(eventsData?.fair || []), ...(eventsData?.rain || [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  // Extract unique guests from RSVPs
  const guests = rsvpsData
    ? Array.from(
        new Map(
          rsvpsData
            .filter((r) => r.guest)
            .map((r) => [r.guest!.id, {
              id: r.guest!.id,
              name: r.guest!.name,
              email: "", // Not collected in our schema
              phone: r.guest!.phone,
              description: r.guest!.description || undefined,
              plusOnes: r.guest!.plusOnes,
            }])
        ).values()
      )
    : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-jet-gray text-cloud-white border-b border-cockpit-dark">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-afterburner-orange" />
            <div>
              <h1 className="font-display font-bold text-xl uppercase tracking-wide">
                Command Center
              </h1>
              <p className="text-xs text-cloud-white/70">Restricted Access</p>
            </div>
          </div>
          <Button
            variant="ghost"
            data-testid="button-logout"
            className="text-cloud-white hover:bg-cloud-white/10"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 h-12">
            <TabsTrigger
              value="settings"
              data-testid="tab-settings"
              className="font-display uppercase text-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="events"
              data-testid="tab-events"
              className="font-display uppercase text-sm"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Events
            </TabsTrigger>
            <TabsTrigger
              value="roster"
              data-testid="tab-roster"
              className="font-display uppercase text-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Roster
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6">
            <AdminSettingsForm
              initialData={{
                eventTitle: settings?.eventTitle || "OPERATION: THIRTY-FIVE",
                eventDescription:
                  settings?.eventDescription ||
                  "Mission Briefing: You are cleared for the ultimate birthday celebration.",
              }}
              onSave={(data) => saveSettingsMutation.mutate(data)}
              isSaving={saveSettingsMutation.isPending}
            />
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-display font-bold text-2xl uppercase tracking-wide">
                  Event Blocks
                </h2>
                <p className="text-muted-foreground">Manage mission schedule</p>
              </div>
              <Button
                data-testid="button-create-event"
                onClick={() => setShowEventForm(!showEventForm)}
                className="font-display uppercase tracking-wide"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>

            {showEventForm && (
              <AdminEventForm
                onSave={(data) => createEventMutation.mutate(data)}
                onCancel={() => setShowEventForm(false)}
                isSaving={createEventMutation.isPending}
              />
            )}

            <div className="space-y-4">
              {allEvents.map((event) => (
                <Card key={event.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-lg">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.planType === "FAIR" ? "☀️ Fair Weather" : "🌧️ Rain Plan"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{event.location}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="font-display uppercase text-xs"
                        onClick={() => deleteEventMutation.mutate(event.id)}
                        disabled={deleteEventMutation.isPending}
                        data-testid={`button-delete-event-${event.id}`}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roster">
            <AdminRosterView
              guests={guests}
              events={allEvents.map((e) => ({
                id: e.id,
                title: e.title,
                planType: e.planType,
              }))}
              rsvps={(rsvpsData || []).map((r) => ({
                guestId: r.guestId,
                eventBlockId: r.eventBlockId,
                status: r.status,
              }))}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
