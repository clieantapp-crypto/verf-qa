import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";

export function Step3Password({ onNext, onBack }: { onNext: (password?: string) => void, onBack: () => void }) {
  return (
    <div className="p-6 md:p-8">
      <h2 className="text-xl font-bold text-right mb-6 pb-2 border-b border-gray-300">
        ضبط كلمة المرور
      </h2>

      <div className="space-y-6">
        <div className="flex flex-col items-end space-y-2 text-[#4a89c2] font-medium">
          <div className="flex items-center gap-2">
             <span>الحد الأدنى للأحرف الصغيرة 1</span>
             <Check className="h-5 w-5 border border-[#4a89c2] rounded text-[#4a89c2]" />
          </div>
          <div className="flex items-center gap-2">
             <span>الحد الأدنى للأحرف الكبيرة 1</span>
             <Check className="h-5 w-5 border border-[#4a89c2] rounded text-[#4a89c2]" />
          </div>
          <div className="flex items-center gap-2">
             <span>الحد الأدنى للأرقام</span>
             <Check className="h-5 w-5 border border-[#4a89c2] rounded text-[#4a89c2]" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-base block text-right">أدخل كلمة المرور</Label>
          <Input type="password" className="bg-white text-right h-12" placeholder="********" />
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-base block text-right">إعادة إدخال كلمة المرور</Label>
          <Input type="password" className="bg-white text-right h-12" placeholder="********" />
        </div>

        <div className="space-y-2">
           <Label className="font-bold text-base block text-right mb-2">التحقق</Label>
           <div className="bg-gray-50 p-4 border border-gray-200 rounded-md w-full max-w-sm ml-auto">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <Checkbox id="robot" />
                 <label htmlFor="robot" className="text-sm text-gray-600 cursor-pointer">
                   أنا لست برنامج روبوت
                 </label>
               </div>
               <div className="flex flex-col items-center">
                 <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin mb-1 opacity-20"></div>
                 <span className="text-[10px] text-gray-400">reCAPTCHA</span>
               </div>
             </div>
           </div>
        </div>

        <div className="flex gap-4 pt-8">
          <Button onClick={() => onNext("password_set")} type="button" className="flex-1 bg-[#1e60a6] hover:bg-[#164e8a] text-white h-12 text-lg">
            استمر
          </Button>
          <Button onClick={onBack} type="button" variant="outline" className="flex-1 bg-[#eee] border-gray-300 hover:bg-gray-200 text-gray-700 h-12 text-lg">
            رجوع
          </Button>
        </div>
      </div>
    </div>
  );
}
