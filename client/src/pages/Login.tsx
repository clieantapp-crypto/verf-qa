import React, { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { User, Lock, ArrowLeft, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans" dir="rtl">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="w-full max-w-md">
          <div className="bg-gray-100/50 p-6 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-8 pb-4 border-b border-gray-300">
              المصادقة مع اسم المستخدم وكلمة المرور
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-800">الدخول بواسطة اسم المستخدم</h2>
            </div>

            <form className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <label className="w-24 text-right font-bold text-gray-700">اسم المستخدم</label>
                  <Input 
                    className="flex-1 bg-white h-12 text-right" 
                    placeholder="إسم المستخدم"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <label className="w-24 text-right font-bold text-gray-700">كلمة المرور</label>
                  <Input 
                    type="password"
                    className="flex-1 bg-white h-12 text-right" 
                    placeholder="كلمة المرور"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 border border-gray-200 rounded-md mt-6">
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

              <div className="flex gap-4 pt-4">
                <Button className="flex-1 bg-[#1e60a6] hover:bg-[#164e8a] text-white h-12 text-lg">
                  استمر
                </Button>
                <Link href="/">
                  <Button variant="outline" className="flex-1 bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700 h-12 text-lg">
                    رجوع
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-8 text-center">
              <Link href="/register">
                <a className="text-[#1e60a6] hover:underline font-bold text-lg">
                  تسجيل مستخدم جديد
                </a>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-6">
         <button className="bg-white p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 text-primary">
            <MessageCircle className="h-8 w-8 fill-primary text-white" />
         </button>
      </div>

      <Footer />
    </div>
  );
}
