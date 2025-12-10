import React from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function Step4Payment({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [_, setLocation] = useLocation();

  const handlePayment = () => {
    setLocation("/payment");
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-center mb-8 pb-4 border-b border-gray-300">
        تسديد الرسوم
      </h2>

      <div className="space-y-6 text-right leading-relaxed text-gray-800 text-lg">
        <p>
          سيتم استيفاء مبلغ (10 ر.ق) بدل رسوم تسجيل لإتمام عملية التسجيل في نظام التوثيق الوطني (توثيق) للإستفادة من المزايا المقدمة من خدمات نظام التوثيق الوطني:
        </p>
        
        <p className="font-bold">وتتمتع خدمة التوثيق الوطني بالمزايا التالية:</p>
        
        <ul className="list-disc pr-6 space-y-3">
          <li>تسهيل ربط الجهات الحكومية بالخدمة من خلال إجراءات مبسطة.</li>
          <li>تأمين استخدام الخدمات الإلكترونية والعمليات من قبل المستخدمين.</li>
          <li>توفير توثيق متعدد المستويات بإستخدام (البطاقة الذكية/ كلمة السر أو كلمة المرور/ البريد الإلكتروني للزائرين أو ذوي الإقامة المؤقتة القصيرة).</li>
          <li>ضمان تسجيل الدخول الموحد للحساب، مما يسهل تجربة العميل عند إتمام أي خدمة أو معاملة إلكترونية.</li>
        </ul>

        <div className="flex gap-4 pt-8 mt-8">
          <Button onClick={handlePayment} type="button" className="flex-1 bg-[#1e60a6] hover:bg-[#164e8a] text-white h-14 text-xl">
            إتمام الدفع
          </Button>
          <Button onClick={onBack} type="button" variant="outline" className="flex-1 bg-white border-gray-300 hover:bg-gray-50 text-gray-800 h-14 text-xl font-medium shadow-sm">
            السابق
          </Button>
        </div>
      </div>
    </div>
  );
}
