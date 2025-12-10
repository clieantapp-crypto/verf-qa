import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Mail, RefreshCw } from "lucide-react";

interface StepOtpVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export function StepOtpVerification({ email, onVerified, onBack }: StepOtpVerificationProps) {
  const { toast } = useToast();
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [demoCode, setDemoCode] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Request OTP on mount
  useEffect(() => {
    requestOtp();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const requestOtp = async () => {
    if (cooldown > 0) return;
    
    setIsSending(true);
    setError("");
    
    try {
      const result = await api.requestOtp(email);
      if (result._demoCode) {
        setDemoCode(result._demoCode);
      }
      toast({
        title: "تم إرسال الرمز",
        description: result.message,
      });
      setCooldown(60); // 60 second cooldown
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...otpDigits];
    pasted.split("").forEach((digit, i) => {
      if (i < 6) newDigits[i] = digit;
    });
    setOtpDigits(newDigits);
  };

  const handleVerify = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setError("يرجى إدخال رمز التحقق المكون من 6 أرقام");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await api.verifyOtp(email, code);
      toast({
        title: "تم التحقق",
        description: "تم التحقق من البريد الإلكتروني بنجاح",
      });
      onVerified();
    } catch (error: any) {
      setError(error.message);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-center mb-2 pb-4 border-b border-gray-300">
        التحقق من البريد الإلكتروني
      </h2>

      <div className="max-w-md mx-auto mt-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-gray-700 mb-2">تم إرسال رمز التحقق إلى:</p>
          <p className="font-bold text-lg text-blue-600 dir-ltr">{email}</p>
        </div>

        {/* Demo Code Display - Only for development */}
        {demoCode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-sm text-yellow-700 mb-1">رمز التحقق (للعرض التوضيحي فقط):</p>
            <p className="text-2xl font-mono font-bold text-yellow-800">{demoCode}</p>
          </div>
        )}

        {/* OTP Input */}
        <div className="flex justify-center gap-2 dir-ltr" onPaste={handlePaste}>
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-12 h-14 text-center text-2xl font-bold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : digit ? "border-blue-500" : "border-gray-300"
              }`}
              data-testid={`input-otp-${index}`}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Resend Button */}
        <div className="text-center">
          <button
            onClick={requestOtp}
            disabled={cooldown > 0 || isSending}
            className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 flex items-center gap-2 mx-auto"
            data-testid="button-resend-otp"
          >
            <RefreshCw className={`h-4 w-4 ${isSending ? "animate-spin" : ""}`} />
            {cooldown > 0 ? `إعادة الإرسال بعد ${cooldown} ثانية` : "إعادة إرسال الرمز"}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            onClick={handleVerify}
            disabled={isLoading || otpDigits.join("").length !== 6}
            className="flex-1 bg-[#1e60a6] hover:bg-[#164e8a] text-white h-14 text-xl"
            data-testid="button-verify-otp"
          >
            {isLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-5 w-5 ml-2" />
                تحقق
              </>
            )}
          </Button>
          <Button
            onClick={onBack}
            type="button"
            variant="outline"
            className="flex-1 bg-white border-gray-300 hover:bg-gray-50 text-gray-800 h-14 text-xl"
            data-testid="button-back-otp"
          >
            السابق
          </Button>
        </div>
      </div>
    </div>
  );
}
