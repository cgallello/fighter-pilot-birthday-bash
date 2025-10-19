import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import SmsCodeInput from "./SmsCodeInput";
import { Shield, Send, CheckCircle2 } from "lucide-react";

type Step = "verify-phone" | "enter-code" | "edit-bio";

interface MissionBioEditorProps {
  guestId: string;
  currentBio?: string | null;
  phone?: string;
  onBioSaved?: () => void;
}

export default function MissionBioEditor({
  guestId,
  currentBio = "",
  phone = "",
  onBioSaved,
}: MissionBioEditorProps) {
  const [step, setStep] = useState<Step>("verify-phone");
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [bio, setBio] = useState(currentBio || "");
  const [countdown, setCountdown] = useState(0);
  const [editToken, setEditToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Send SMS code mutation
  const sendCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/sms/start", {
        guestId,
        phone: phoneNumber !== phone ? phoneNumber : undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "📱 Code Sent",
        description: "Check your phone for the verification code",
      });
      setStep("enter-code");
      
      // Start countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to Send Code",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Verify code mutation
  const verifyCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/auth/sms/verify", {
        guestId,
        code,
      });
      return await res.json() as { success: boolean; editToken: string };
    },
    onSuccess: (data) => {
      setEditToken(data.editToken);
      setStep("edit-bio");
      toast({
        title: "✅ Verified",
        description: "You can now edit your mission bio",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Invalid Code",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Save bio mutation
  const saveBioMutation = useMutation({
    mutationFn: async () => {
      if (!editToken) throw new Error("No edit token");
      
      const res = await fetch(`/api/auth/guests/${guestId}/description`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${editToken}`,
        },
        body: JSON.stringify({ description: bio }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save bio");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Bio Saved",
        description: "Your mission bio has been updated",
      });
      onBioSaved?.();
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to Save",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSendCode = () => {
    sendCodeMutation.mutate();
  };

  const handleCodeComplete = (code: string) => {
    verifyCodeMutation.mutate(code);
  };

  const handleSaveBio = () => {
    saveBioMutation.mutate();
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
              <p className="text-xs text-muted-foreground">
                We'll send a verification code to this number
              </p>
            </div>
            <Button
              data-testid="button-send-code"
              onClick={handleSendCode}
              disabled={!phoneNumber || sendCodeMutation.isPending}
              className="w-full h-11 font-display uppercase tracking-wide"
            >
              {sendCodeMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Scramble Code
                </>
              )}
            </Button>
          </div>
        )}

        {step === "enter-code" && (
          <div className="space-y-6">
            <SmsCodeInput onComplete={handleCodeComplete} />
            
            {verifyCodeMutation.isPending && (
              <p className="text-center text-sm text-muted-foreground">
                Verifying code...
              </p>
            )}
            
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
                  disabled={sendCodeMutation.isPending}
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
              disabled={saveBioMutation.isPending}
              className="w-full h-11 font-display uppercase tracking-wide"
            >
              {saveBioMutation.isPending ? "Saving..." : "Save Mission Bio"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
