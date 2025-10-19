import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Search, CheckCircle, XCircle } from "lucide-react";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  description?: string;
}

interface EventBlock {
  id: string;
  title: string;
  planType: "FAIR" | "RAIN";
}

interface RSVP {
  guestId: string;
  eventBlockId: string;
  status: "JOINED" | "DECLINED";
}

interface AdminRosterViewProps {
  guests: Guest[];
  events: EventBlock[];
  rsvps: RSVP[];
}

export default function AdminRosterView({ guests, events, rsvps }: AdminRosterViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredGuests = guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getGuestRSVPs = (guestId: string) => {
    return rsvps.filter((r) => r.guestId === guestId && r.status === "JOINED");
  };

  const getEventGuests = (eventId: string) => {
    const eventRSVPs = rsvps.filter((r) => r.eventBlockId === eventId && r.status === "JOINED");
    return eventRSVPs.map((r) => guests.find((g) => g.id === r.guestId)!).filter(Boolean);
  };

  return (
    <div className="space-y-6">
      {/* Guest Roster */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="font-display text-2xl uppercase tracking-wide flex items-center gap-2">
                <Users className="w-6 h-6" />
                Pilot Roster
              </CardTitle>
              <CardDescription>{guests.length} registered pilots</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-testid="input-search-guests"
                placeholder="Search pilots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Callsign</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>RSVPs</TableHead>
                  <TableHead>Mission Bio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => {
                  const guestRSVPs = getGuestRSVPs(guest.id);
                  return (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">{guest.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div>{guest.email}</div>
                        <div>{guest.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{guestRSVPs.length} events</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                        {guest.description || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* RSVP Matrix by Event */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">
            RSVP Matrix
          </CardTitle>
          <CardDescription>Attendance breakdown by event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {events.map((event) => {
            const eventGuests = getEventGuests(event.id);
            return (
              <div key={event.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-semibold text-lg">{event.title}</h3>
                    <Badge variant="outline" className="font-display text-xs">
                      {event.planType === "FAIR" ? "☀️ Fair" : "🌧️ Rain"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-radar-green" />
                    <span className="font-medium">{eventGuests.length} attending</span>
                  </div>
                </div>
                {eventGuests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {eventGuests.map((guest) => (
                      <Badge key={guest.id} variant="secondary">
                        {guest.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No RSVPs yet</p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
