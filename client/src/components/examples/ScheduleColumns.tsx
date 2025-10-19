import ScheduleColumns from "../ScheduleColumns";

export default function ScheduleColumnsExample() {
  // Mock data
  const fairEvents = [
    {
      id: "1",
      title: "Pre-Flight Briefing",
      description: "Mission objectives and safety protocols",
      startTime: new Date("2025-03-15T14:00:00"),
      endTime: new Date("2025-03-15T15:00:00"),
      location: "Command Center, 123 Squadron Ave",
      planType: "FAIR" as const,
      sortOrder: 1,
    },
    {
      id: "2",
      title: "Outdoor Flight Exercises",
      description: "Tactical maneuvers and formation flying",
      startTime: new Date("2025-03-15T15:30:00"),
      endTime: new Date("2025-03-15T17:00:00"),
      location: "Airfield Training Ground",
      planType: "FAIR" as const,
      sortOrder: 2,
    },
  ];

  const rainEvents = [
    {
      id: "3",
      title: "Indoor Simulator Training",
      description: "State-of-the-art flight simulation",
      startTime: new Date("2025-03-15T14:00:00"),
      endTime: new Date("2025-03-15T16:00:00"),
      location: "Hangar 5, Simulator Bay",
      planType: "RAIN" as const,
      sortOrder: 1,
    },
  ];

  return (
    <div className="p-8 bg-background">
      <ScheduleColumns
        fairEvents={fairEvents}
        rainEvents={rainEvents}
        onToggleRSVP={(id, joined) => console.log("RSVP:", id, joined)}
      />
    </div>
  );
}
