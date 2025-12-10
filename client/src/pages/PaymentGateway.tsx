import React, { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, ShieldCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PaymentGateway() {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans" dir="rtl">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex justify-center items-start md:items-center">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Card Preview & Order Summary */}
            <div className="space-y-6 order-2 md:order-1">
                {/* Credit Card Visualization */}
                <div className="relative h-56 w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-xl overflow-hidden text-white p-6 flex flex-col justify-between transform transition-transform hover:scale-[1.02] duration-300">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-blue-500 opacity-10 rounded-full blur-2xl"></div>
                    
                    <div className="flex justify-between items-start z-10">
                        <img src="https://img.icons8.com/color/48/000000/chip-card.png" alt="Chip" className="h-10 w-10 opacity-90" />
                        <div className="flex flex-col items-end">
                             <h3 className="text-sm font-semibold opacity-70 tracking-widest">CREDIT CARD</h3>
                             <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-8 mt-1" />
                        </div>
                    </div>

                    <div className="space-y-6 z-10">
                        <div className="space-y-1">
                            <span className="text-xs uppercase opacity-70 tracking-wider">Card Number</span>
                            <div className="text-2xl font-mono tracking-wider font-bold drop-shadow-md min-h-[32px]">
                                {cardNumber || "**** **** **** ****"}
                            </div>
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="space-y-1">
                                <span className="text-xs uppercase opacity-70 tracking-wider">Card Holder</span>
                                <div className="text-sm font-bold uppercase tracking-wide truncate max-w-[180px]">
                                    {cardName || "YOUR NAME"}
                                </div>
                            </div>
                            <div className="space-y-1 text-left">
                                <span className="text-xs uppercase opacity-70 tracking-wider">Expires</span>
                                <div className="text-sm font-bold tracking-wider">
                                    {expiry || "MM/YY"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Box */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">ملخص الدفع</h3>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">رسوم التسجيل</span>
                        <span className="font-bold">10.00 ر.ق</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">الضريبة</span>
                        <span className="font-bold">0.00 ر.ق</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="font-bold text-gray-900">المجموع الكلي</span>
                        <span className="font-bold text-xl text-[#1e60a6]">10.00 ر.ق</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Payment Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 order-1 md:order-2">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">الدفع الإلكتروني</h1>
                        <p className="text-sm text-gray-500 mt-1">أدخل بيانات البطاقة لإتمام العملية</p>
                    </div>
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
                        <Lock className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex items-center gap-3 mb-6">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">بياناتك مشفرة ومحمية بنسبة 100%</span>
                </div>

                <form className="space-y-6">
                    <div className="space-y-3">
                        <Label className="font-bold text-sm text-gray-700">طريقة الدفع</Label>
                        <RadioGroup defaultValue="visa" className="grid grid-cols-3 gap-3">
                            <label className="cursor-pointer border-2 border-transparent hover:border-gray-200 [&:has(:checked)]:border-blue-500 [&:has(:checked)]:bg-blue-50 rounded-lg p-3 flex flex-col items-center justify-center transition-all bg-gray-50">
                                 <RadioGroupItem value="visa" id="visa" className="sr-only" />
                                 <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-8 mb-2" alt="Visa" />
                                 <span className="text-xs font-bold text-gray-600">Visa</span>
                            </label>
                            <label className="cursor-pointer border-2 border-transparent hover:border-gray-200 [&:has(:checked)]:border-blue-500 [&:has(:checked)]:bg-blue-50 rounded-lg p-3 flex flex-col items-center justify-center transition-all bg-gray-50">
                                 <RadioGroupItem value="master" id="master" className="sr-only" />
                                 <img src="https://img.icons8.com/color/48/000000/mastercard.png" className="h-8 mb-2" alt="Mastercard" />
                                 <span className="text-xs font-bold text-gray-600">Mastercard</span>
                            </label>
                            <label className="cursor-pointer border-2 border-transparent hover:border-gray-200 [&:has(:checked)]:border-blue-500 [&:has(:checked)]:bg-blue-50 rounded-lg p-3 flex flex-col items-center justify-center transition-all bg-gray-50">
                                 <RadioGroupItem value="naps" id="naps" className="sr-only" />
                                 <CreditCard className="h-8 w-8 mb-2 text-gray-400" />
                                 <span className="text-xs font-bold text-gray-600">Debit / NAPS</span>
                            </label>
                        </RadioGroup>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="font-bold text-sm text-gray-700">الاسم على البطاقة</Label>
                            <div className="relative">
                                <Input 
                                    className="pl-10 text-right h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors" 
                                    placeholder="الاسم كما يظهر على البطاقة" 
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold text-sm text-gray-700">رقم البطاقة</Label>
                            <div className="relative dir-ltr">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input 
                                    className="pl-10 text-left h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors font-mono tracking-widest" 
                                    placeholder="0000 0000 0000 0000" 
                                    maxLength={19}
                                    value={cardNumber}
                                    onChange={(e) => {
                                        const formatted = formatCardNumber(e.target.value);
                                        setCardNumber(formatted);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-bold text-sm text-gray-700">تاريخ الانتهاء</Label>
                                <Input 
                                    className="text-center h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors" 
                                    placeholder="MM / YY" 
                                    maxLength={5}
                                    value={expiry}
                                    onChange={(e) => setExpiry(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-sm text-gray-700 flex items-center justify-between">
                                    <span>رمز الأمان (CVV)</span>
                                    <span className="text-xs text-gray-400 font-normal">3 أرقام خلف البطاقة</span>
                                </Label>
                                <Input 
                                    className="text-center h-12 bg-gray-50 border-gray-200 focus:bg-white transition-colors" 
                                    placeholder="123" 
                                    maxLength={3}
                                    type="password"
                                    value={cvv}
                                    onChange={(e) => setCvv(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Button className="w-full bg-[#1e60a6] hover:bg-[#164e8a] text-white h-14 text-lg font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 mt-2">
                        إتمام عملية الدفع (10.00 ر.ق)
                    </Button>
                </form>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
