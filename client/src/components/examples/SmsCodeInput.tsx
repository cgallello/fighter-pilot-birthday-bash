import SmsCodeInput from "../SmsCodeInput";

export default function SmsCodeInputExample() {
  return (
    <div className="p-8 bg-background flex items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <h3 className="text-center font-display text-xl uppercase tracking-wide">
          Enter Scramble Code
        </h3>
        <SmsCodeInput onComplete={(code) => console.log("Code entered:", code)} />
        <p className="text-center text-sm text-muted-foreground">
          Enter the 6-digit code sent to your scramble line
        </p>
      </div>
    </div>
  );
}
