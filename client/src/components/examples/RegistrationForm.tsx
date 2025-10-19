import RegistrationForm from "../RegistrationForm";

export default function RegistrationFormExample() {
  return (
    <div className="p-8 bg-background max-w-md">
      <RegistrationForm
        onRegister={(data) => console.log("Registered:", data)}
      />
    </div>
  );
}
