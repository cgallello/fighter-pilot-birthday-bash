import AdminSettingsForm from "../AdminSettingsForm";

export default function AdminSettingsFormExample() {
  return (
    <div className="p-8 bg-background max-w-2xl mx-auto">
      <AdminSettingsForm
        initialData={{
          eventTitle: "OPERATION: THIRTY-FIVE",
          eventDescription:
            "Mission Briefing: You are cleared for the ultimate birthday celebration. Confirm your deployment slot and prepare for tactical fun at 35,000 feet of awesome!",
        }}
        onSave={(data) => console.log("Settings saved:", data)}
      />
    </div>
  );
}
