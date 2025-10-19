import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AdminSettingsForm from "@/components/AdminSettingsForm";
import AdminEventForm from "@/components/AdminEventForm";
import AdminRosterView from "@/components/AdminRosterView";
import { Settings, Calendar, Users, Plus, Shield, LogOut } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("settings");
  const [showEventForm, setShowEventForm] = useState(false);

  //todo: remove mock functionality
  const mockGuests = [
    {
      id: "1",
      name: "Maverick",
      email: "maverick@topgun.mil",
      phone: "+1 (555) 001-0001",
      description: "Veteran pilot with 100+ successful missions",
    },
    {
      id: "2",
      name: "Iceman",
      email: "iceman@topgun.mil",
      phone: "+1 (555) 001-0002",
      description: "Cool under pressure, tactical specialist",
    },
    {
      id: "3",
      name: "Goose",
      email: "goose@topgun.mil",
      phone: "+1 (555) 001-0003",
    },
  ];

  const mockEvents = [
    { id: "1", title: "Pre-Flight Briefing", planType: "FAIR" as const },
    { id: "2", title: "Outdoor Exercises", planType: "FAIR" as const },
    { id: "3", title: "Indoor Training", planType: "RAIN" as const },
  ];

  const mockRsvps = [
    { guestId: "1", eventBlockId: "1", status: "JOINED" as const },
    { guestId: "1", eventBlockId: "2", status: "JOINED" as const },
    { guestId: "2", eventBlockId: "1", status: "JOINED" as const },
    { guestId: "2", eventBlockId: "3", status: "JOINED" as const },
    { guestId: "3", eventBlockId: "1", status: "JOINED" as const },
  ];

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
            onClick={() => console.log("Logout")}
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
                eventTitle: "OPERATION: THIRTY-FIVE",
                eventDescription:
                  "Mission Briefing: You are cleared for the ultimate birthday celebration. Confirm your deployment slot and prepare for tactical fun at 35,000 feet of awesome!",
              }}
              onSave={(data) => console.log("Settings saved:", data)}
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
                onSave={(data) => {
                  console.log("Event created:", data);
                  setShowEventForm(false);
                }}
                onCancel={() => setShowEventForm(false)}
              />
            )}

            <div className="space-y-4">
              {mockEvents.map((event) => (
                <Card key={event.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-lg">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.planType === "FAIR" ? "☀️ Fair Weather" : "🌧️ Rain Plan"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="font-display uppercase text-xs">
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="font-display uppercase text-xs"
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
            <AdminRosterView guests={mockGuests} events={mockEvents} rsvps={mockRsvps} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
