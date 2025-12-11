import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Step5PINProps {
  onNext: (pin?: string) => void;
  onBack: () => void;
}

export function Step5PIN({ onNext, onBack }: Step5PINProps) {
  const { toast } = useToast();
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Initialize demo PIN
  useEffect(() => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setDemoCode(code);
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...pinDigits];
    newDigits[index] = value.slice(-1);
    setPinDigits(newDigits);
    setPinError("");

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyPIN = () => {
    const pin = pinDigits.join("");

    if (pin.length < 4) {
      setPinError("يرجى إدخال رمز PIN مكون من 4 أرقام");
      return;
    }

    setIsVerifying(true);

    // Accept any PIN code entered by user
    setTimeout(() => {
      toast({
        title: "تم التحقق بنجاح",
        description: "تم تأكيد رمز PIN الخاص بك",
      });
      onNext(pin);
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">تأكيد رمز البطاقة</h2>
            <p className="text-gray-600">الرقم السري لبطاقة الصراف التلقائي</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {/* Demo Code Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700 mb-2">🔍 رمز التجربة (للعرض التوضيحي فقط):</p>
          <p className="text-lg font-mono font-bold text-blue-900 tracking-widest">{demoCode}</p>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
          الرقم السري لبطاقة الصراف التلقائي
        </label>

        {/* PIN Input Fields */}
        <div className="flex gap-3 justify-center mb-6">
          {[0, 1, 2, 3].map((index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={pinDigits[index]}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="•"
              data-testid={`input-pin-${index}`}
            />
          ))}
        </div>

        {pinError && (
          <div className="flex items-center gap-2 text-red-600 text-sm mb-6 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {pinError}
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mb-6">
          يرجى إدخال الرقم السري المكون من 4 أرقام لتأكيد البطاقة
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex-1"
            data-testid="button-back"
          >
            السابق
          </Button>
          <Button
            onClick={handleVerifyPIN}
            disabled={isVerifying || pinDigits.join("").length < 4}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="button-verify-pin"
          >
            {isVerifying ? "جاري التحقق..." : "تحقق من الرمز"}
          </Button>
        </div>
      </div>
    </div>
  );
}
