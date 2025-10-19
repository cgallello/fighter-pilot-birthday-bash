import AdminEventForm from "../AdminEventForm";

export default function AdminEventFormExample() {
  return (
    <div className="p-8 bg-background max-w-3xl mx-auto">
      <AdminEventForm
        onSave={(data) => console.log("Event saved:", data)}
        onCancel={() => console.log("Cancelled")}
      />
    </div>
  );
}
