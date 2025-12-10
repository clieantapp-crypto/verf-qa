import React from "react";
import { Link } from "wouter";
import logo from "@assets/generated_images/logo_for_tawtheeq_national_authentication_system.png";
import { Globe, Menu } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <a className="flex items-center gap-3">
              <img src={logo} alt="Tawtheeq Logo" className="h-12 w-12 object-contain" />
              <div className="flex flex-col items-start">
                <span className="text-primary font-bold text-lg leading-tight">نظام التوثيق الوطني</span>
                <span className="text-primary/80 text-xs font-semibold tracking-wide">National Authentication System</span>
              </div>
            </a>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <span className="hidden md:inline font-medium">العربية</span>
            <Globe className="h-5 w-5" />
          </button>
          
          <div className="border-r border-gray-300 h-8 mx-2 hidden md:block"></div>

          <Link href="/login">
            <a className="flex flex-col items-end">
               <img src={logo} alt="Tawtheeq Small" className="h-8 w-8 object-contain opacity-80" />
               <span className="text-[10px] text-primary font-bold">توثيق</span>
            </a>
          </Link>
        </div>
      </div>
      <div className="bg-[#f0f2f5] py-1 border-t border-gray-100 text-center text-xs text-gray-500">
        تم بناء هذا الموقع على Wix. أنشئ حسابك
      </div>
    </header>
  );
}
