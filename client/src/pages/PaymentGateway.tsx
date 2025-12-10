import React from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, ShieldCheck } from "lucide-react";

export default function PaymentGateway() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans" dir="rtl">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex justify-center">
        <div className="w-full max-w-lg bg-gray-100/50 p-6 md:p-8 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">الدفع الإلكتروني</h1>
                <div className="bg-black text-white p-2 rounded-full">
                    <CreditCard className="h-6 w-6" />
                </div>
            </div>

            <div className="flex items-center gap-2 mb-8 bg-white/50 p-3 rounded-lg">
                <ShieldCheck className="h-6 w-6 text-green-600" />
                <span className="text-gray-600 font-medium">جميع عمليات الدفع آمنة ومحمية 100%</span>
            </div>

            <form className="space-y-6">
                <div className="space-y-3">
                    <Label className="font-bold text-lg">طريقة الدفع *</Label>
                    <RadioGroup defaultValue="visa" className="space-y-3">
                        <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                             <Label htmlFor="visa" className="cursor-pointer flex-1">بطاقة فيزا</Label>
                             <RadioGroupItem value="visa" id="visa" />
                        </div>
                        <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                             <Label htmlFor="master" className="cursor-pointer flex-1">بطاقة ماستر كارد</Label>
                             <RadioGroupItem value="master" id="master" />
                        </div>
                        <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                             <Label htmlFor="debit" className="cursor-pointer flex-1">بطاقة Debit</Label>
                             <RadioGroupItem value="debit" id="debit" />
                        </div>
                    </RadioGroup>
                </div>

                <div className="bg-gray-200/50 p-6 rounded-lg space-y-4 -mx-2">
                    <div className="space-y-2">
                        <Label className="font-bold text-right block">الأسم على البطاقة</Label>
                        <Input className="bg-white text-right h-12" placeholder="الاسم على البطاقة" />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold text-right block">الرقم المدون على البطاقة</Label>
                        <Input className="bg-white text-center h-12 tracking-widest" placeholder="*** **** **** ****" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-bold text-right block">كود الحماية</Label>
                            <Input className="bg-white text-center h-12" placeholder="C V V" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-bold text-right block">تاريخ الإنتهاء</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input className="bg-white text-center h-12" placeholder="السنة" />
                                <Input className="bg-white text-center h-12" placeholder="شهر" />
                            </div>
                        </div>
                    </div>
                </div>

                <Button className="w-full bg-black hover:bg-gray-800 text-white h-14 text-xl font-bold mt-4 rounded-full">
                    تسديد
                </Button>
            </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
