import RegistrationForm from "../RegistrationForm";

export default function RegistrationFormExample() {
  return (
    <div className="p-8 bg-background">
      <RegistrationForm
        onRegister={(data) => console.log("Registered:", data)}
      />
    </div>
  );
}
