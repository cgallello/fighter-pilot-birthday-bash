import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SmsCodeInput from "./SmsCodeInput";
import { Shield, Send, CheckCircle2 } from "lucide-react";

type Step = "verify-phone" | "enter-code" | "edit-bio";

interface MissionBioEditorProps {
  currentBio?: string;
  phone?: string;
  onSave: (bio: string) => void;
  onRequestCode: (phone: string) => void;
  onVerifyCode: (code: string) => void;
}

export default function MissionBioEditor({
  currentBio = "",
  phone = "",
  onSave,
  onRequestCode,
  onVerifyCode,
}: MissionBioEditorProps) {
  const [step, setStep] = useState<Step>("verify-phone");
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [bio, setBio] = useState(currentBio);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = () => {
    console.log("Sending code to:", phoneNumber);
    onRequestCode(phoneNumber);
    setCodeSent(true);
    setCountdown(60);
    setStep("enter-code");

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCodeComplete = (code: string) => {
    console.log("Verifying code:", code);
    onVerifyCode(code);
    // Simulate success
    setTimeout(() => {
      setStep("edit-bio");
    }, 500);
  };

  const handleSaveBio = () => {
    console.log("Saving bio:", bio);
    onSave(bio);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <Shield className="w-8 h-8 text-primary" />
          </div>
        </div>
        <CardTitle className="font-display text-2xl uppercase tracking-wide">
          Mission Bio Editor
        </CardTitle>
        <CardDescription>
          {step === "verify-phone" && "Verify your scramble line to unlock editing"}
          {step === "enter-code" && "Enter your verification code"}
          {step === "edit-bio" && "Edit unlocked for 24 hours"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === "verify-phone" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-phone" className="text-sm font-medium uppercase tracking-wide">
                Scramble Line (Phone)
              </Label>
              <Input
                id="verify-phone"
                data-testid="input-verify-phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="h-11"
              />
            </div>
            <Button
              data-testid="button-send-code"
              onClick={handleSendCode}
              disabled={!phoneNumber}
              className="w-full h-11 font-display uppercase tracking-wide"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Scramble Code
            </Button>
          </div>
        )}

        {step === "enter-code" && (
          <div className="space-y-6">
            <SmsCodeInput onComplete={handleCodeComplete} />
            
            <div className="text-center space-y-2">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend code in {countdown}s
                </p>
              ) : (
                <Button
                  variant="ghost"
                  data-testid="button-resend-code"
                  onClick={handleSendCode}
                  className="text-sm"
                >
                  Resend Code
                </Button>
              )}
            </div>
          </div>
        )}

        {step === "edit-bio" && (
          <div className="space-y-4">
            <div className="bg-radar-green/10 border border-radar-green/30 rounded-md p-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-radar-green flex-shrink-0" />
              <p className="text-sm font-medium text-radar-green">
                ✅ Callsign confirmed. You can edit your mission bio for 24 hours.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission-bio" className="text-sm font-medium uppercase tracking-wide">
                Your Mission Bio
              </Label>
              <Textarea
                id="mission-bio"
                data-testid="textarea-mission-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about your pilot expertise and what makes you mission-ready..."
                className="min-h-32 resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {bio.length}/500 characters
              </p>
            </div>

            <Button
              data-testid="button-save-bio"
              onClick={handleSaveBio}
              className="w-full h-11 font-display uppercase tracking-wide"
            >
              Save Mission Bio
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
