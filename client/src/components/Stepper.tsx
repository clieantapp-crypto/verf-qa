import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="w-full py-8 px-4 bg-white shadow-sm mb-6">
      <div className="max-w-3xl mx-auto">
        <div className="relative flex justify-between items-center">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200 -z-10 transform -translate-y-1/2" />
          
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <div key={index} className="flex flex-col items-center bg-white px-2">
                <div 
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 mb-2",
                    isActive ? "bg-primary text-white border-primary" : 
                    isCompleted ? "bg-primary text-white border-primary" : "bg-gray-100 text-gray-400 border-gray-200"
                  )}
                >
                  {isCompleted ? <Check className="h-6 w-6" /> : stepNumber}
                </div>
                <span 
                  className={cn(
                    "text-xs md:text-sm font-medium whitespace-nowrap",
                    isActive ? "text-primary" : "text-gray-500"
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
