import EventCard from "../EventCard";

export default function EventCardExample() {
  return (
    <div className="p-8 bg-background max-w-md">
      <EventCard
        id="1"
        title="Pre-Flight Briefing"
        description="Get your mission objectives and safety protocols. All pilots must attend this crucial briefing before deployment."
        startTime={new Date("2025-03-15T14:00:00")}
        endTime={new Date("2025-03-15T15:00:00")}
        location="Command Center, 123 Squadron Ave"
        planType="FAIR"
        onToggleRSVP={(id, joined) => console.log("RSVP toggled:", id, joined)}
      />
    </div>
  );
}
