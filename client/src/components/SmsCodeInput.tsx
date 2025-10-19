import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface SmsCodeInputProps {
  length?: number;
  onComplete: (code: string) => void;
}

export default function SmsCodeInput({ length = 6, onComplete }: SmsCodeInputProps) {
  const [code, setCode] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, "").slice(-1);

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newCode.every((d) => d !== "") && newCode.join("").length === length) {
      onComplete(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    const digits = pastedData.slice(0, length).split("");

    const newCode = [...code];
    digits.forEach((digit, i) => {
      if (i < length) {
        newCode[i] = digit;
      }
    });

    setCode(newCode);

    // Focus last filled input or first empty one
    const lastFilledIndex = Math.min(digits.length, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    // Check if complete
    if (newCode.every((d) => d !== "")) {
      onComplete(newCode.join(""));
    }
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {code.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          data-testid={`input-code-${index}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-14 text-center text-2xl font-mono font-bold"
        />
      ))}
    </div>
  );
}
