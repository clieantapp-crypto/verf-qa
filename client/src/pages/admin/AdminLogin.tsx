import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";
import logo from "@assets/generated_images/logo_for_tawtheeq_national_authentication_system.png";

export default function AdminLogin() {
  const [_, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans" dir="ltr">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 pb-0 flex justify-center">
            <div className="h-20 w-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
            </div>
        </div>
        <div className="px-8 pb-8">
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Admin Portal</h1>
            <p className="text-center text-gray-500 mb-8">Enter your credentials to access the dashboard</p>

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                    <Label>Username</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input className="pl-10" placeholder="admin" defaultValue="admin" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input className="pl-10" type="password" placeholder="••••••••" defaultValue="password" />
                    </div>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base mt-4">
                    Sign In
                </Button>
            </form>
        </div>
        <div className="bg-gray-50 py-4 px-8 text-center text-xs text-gray-400 border-t border-gray-100">
            Secure Admin Access • Tawtheeq System
        </div>
      </div>
    </div>
  );
}
