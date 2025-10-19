import AdminRosterView from "../AdminRosterView";

export default function AdminRosterViewExample() {
  // Mock data
  const guests = [
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

  const events = [
    { id: "1", title: "Pre-Flight Briefing", planType: "FAIR" as const },
    { id: "2", title: "Outdoor Exercises", planType: "FAIR" as const },
    { id: "3", title: "Indoor Training", planType: "RAIN" as const },
  ];

  const rsvps = [
    { guestId: "1", eventBlockId: "1", status: "JOINED" as const },
    { guestId: "1", eventBlockId: "2", status: "JOINED" as const },
    { guestId: "2", eventBlockId: "1", status: "JOINED" as const },
    { guestId: "2", eventBlockId: "3", status: "JOINED" as const },
    { guestId: "3", eventBlockId: "1", status: "JOINED" as const },
  ];

  return (
    <div className="p-8 bg-background">
      <AdminRosterView guests={guests} events={events} rsvps={rsvps} />
    </div>
  );
}
