import MissionBioEditor from "../MissionBioEditor";

export default function MissionBioEditorExample() {
  return (
    <div className="p-8 bg-background">
      <MissionBioEditor
        currentBio="Veteran pilot with 100+ successful missions"
        phone="+1 (555) 123-4567"
        onSave={(bio) => console.log("Bio saved:", bio)}
        onRequestCode={(phone) => console.log("Code requested for:", phone)}
        onVerifyCode={(code) => console.log("Code verified:", code)}
      />
    </div>
  );
}
