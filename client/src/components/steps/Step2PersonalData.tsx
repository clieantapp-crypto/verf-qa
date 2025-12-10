import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function Step2PersonalData({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  return (
    <div className="p-6 md:p-8">
      <h2 className="text-xl font-bold text-center mb-6 pb-4 border-b border-gray-300 bg-gray-200/50 py-3 rounded-t-lg -mx-6 -mt-6 md:-mx-8 md:-mt-8">
        يرجى تعبئة البيانات الشخصية
      </h2>

      <form className="space-y-6">
        <div className="space-y-3">
          <Label className="font-bold text-base">الجنسية *</Label>
          <RadioGroup defaultValue="qatar" className="flex gap-8">
            <div className="flex items-center space-x-reverse space-x-2">
              <RadioGroupItem value="qatar" id="qatar" />
              <Label htmlFor="qatar" className="font-medium">قطر</Label>
            </div>
            <div className="flex items-center space-x-reverse space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other" className="font-medium">جنسية اخرى</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-base">الاسم بالعربي *(من 3 مقاطع)</Label>
          <Input className="bg-white text-right h-12" placeholder="مثال... عمر هاشم الهاشم" />
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-base">الاسم بالانجليزية *(من 3 مقاطع)</Label>
          <Input className="bg-white text-left h-12" placeholder="Example... Omar Hashim Alhashim" dir="ltr" />
          <p className="text-red-800 text-sm font-medium">يرجى إدخال الإسم باللغتين العربية والإنجليزية</p>
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-base">رقم الهاتف *</Label>
          <Input className="bg-white text-right h-12" placeholder="أدخل رقم الهاتف" />
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-base">تاريخ الميلاد * يوم/شهر/سنة</Label>
          <Input type="date" className="bg-white text-right h-12" />
        </div>

        <div className="space-y-3">
          <Label className="font-bold text-base">الجنس *</Label>
          <RadioGroup defaultValue="male" className="flex gap-8">
            <div className="flex items-center space-x-reverse space-x-2">
              <RadioGroupItem value="male" id="male" />
              <Label htmlFor="male" className="font-medium">ذكر</Label>
            </div>
            <div className="flex items-center space-x-reverse space-x-2">
              <RadioGroupItem value="female" id="female" />
              <Label htmlFor="female" className="font-medium">أنثى</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
           <Label className="font-bold text-base">العنوان</Label>
           <div className="bg-[#4a89c2] p-4 rounded-lg space-y-4">
              <div className="space-y-1">
                 <Label className="text-white text-sm">رقم المبنى</Label>
                 <Input className="bg-white h-10 border-none" placeholder="رقم المبنى" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <Label className="text-white text-sm">منطقة</Label>
                   <Input className="bg-white h-10 border-none" placeholder="منطقة" />
                </div>
                <div className="space-y-1">
                   <Label className="text-white text-sm">شارع</Label>
                   <Input className="bg-white h-10 border-none" placeholder="شارع" />
                </div>
              </div>
           </div>
        </div>

        <div className="space-y-2">
          <Label className="font-bold text-base">أعد إدخال البريد الإلكتروني *</Label>
          <Input type="email" className="bg-white text-right h-12" placeholder="البريد الالكتروني" />
        </div>

        <div className="space-y-2 text-center">
           <Label className="font-bold text-base mb-2 block">التحقق</Label>
           <div className="flex justify-center">
             <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button onClick={onNext} type="button" className="flex-1 bg-[#1e60a6] hover:bg-[#164e8a] text-white h-12 text-lg">
            استمر
          </Button>
          <Button onClick={onBack} type="button" variant="outline" className="flex-1 bg-white border-gray-300 hover:bg-gray-50 text-gray-700 h-12 text-lg">
            رجوع
          </Button>
        </div>
      </form>
    </div>
  );
}
