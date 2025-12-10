import React from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export function Step1AccountType({ onNext }: { onNext: () => void }) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-bold text-center mb-8 pb-4 border-b border-gray-300">
        اختر نوع الحساب
      </h2>
      
      <div className="space-y-6 max-w-md mx-auto">
        <RadioGroup defaultValue="citizen" className="space-y-4">
          <div className="flex items-center space-x-reverse space-x-4 bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-primary transition-colors">
            <RadioGroupItem value="citizen" id="citizen" />
            <Label htmlFor="citizen" className="flex-1 cursor-pointer font-bold text-lg">مواطن / مقيم</Label>
          </div>
          <div className="flex items-center space-x-reverse space-x-4 bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-primary transition-colors">
            <RadioGroupItem value="visitor" id="visitor" />
            <Label htmlFor="visitor" className="flex-1 cursor-pointer font-bold text-lg">زائر</Label>
          </div>
        </RadioGroup>

        <div className="pt-8">
          <Button onClick={onNext} className="w-full bg-[#1e60a6] hover:bg-[#164e8a] text-white h-12 text-lg">
            استمر
          </Button>
        </div>
      </div>
    </div>
  );
}
