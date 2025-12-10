import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Users, 
  Activity, 
  CreditCard, 
  TrendingUp,
  Globe,
  Wifi,
  WifiOff,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const { isConnected, stats: realtimeStats, clearNewApplication } = useWebSocket();
  const [stats, setStats] = useState({
    totalVisitors: 0,
    activeNow: 0,
    applications: 0,
    revenue: 0,
    visitorsByCountry: {} as Record<string, number>,
    applicationsByStatus: {
      pending: 0,
      completed: 0,
      review: 0,
      rejected: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Refresh every 10s for more live updates
    return () => clearInterval(interval);
  }, []);

  // Show notification for new applications
  useEffect(() => {
    if (realtimeStats.newApplication) {
      toast({
        title: "New Application Received!",
        description: `${realtimeStats.newApplication.applicantName} submitted a new registration`,
      });
      setStats(prev => ({
        ...prev,
        applications: realtimeStats.totalApplications
      }));
      setLastUpdate(new Date());
      clearNewApplication();
    }
  }, [realtimeStats.newApplication]);

  // Update online count from WebSocket
  useEffect(() => {
    if (realtimeStats.onlineCount > 0) {
      setStats(prev => ({
        ...prev,
        activeNow: realtimeStats.onlineCount
      }));
    }
  }, [realtimeStats.onlineCount]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const totalStatusCount = Object.values(stats.applicationsByStatus).reduce((a, b) => a + b, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Dashboard</h1>
            <p className="text-gray-500">Real-time monitoring of system activity</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last update: {formatTime(lastUpdate)}
            </div>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
              isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}>
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <span className="hidden sm:inline">Live</span>
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Visitors" 
            value={loading ? "..." : stats.totalVisitors.toLocaleString()} 
            icon={Users}
            color="bg-blue-500"
            isLive={false}
          />
          <StatCard 
            title="Active Now" 
            value={loading ? "..." : stats.activeNow.toString()} 
            icon={Activity}
            color="bg-green-500"
            isLive={true}
          />
          <StatCard 
            title="Applications" 
            value={loading ? "..." : stats.applications.toLocaleString()} 
            icon={CreditCard}
            color="bg-purple-500"
            isLive={true}
          />
          <StatCard 
            title="Revenue" 
            value={loading ? "..." : `QAR ${stats.revenue.toLocaleString()}`} 
            icon={TrendingUp}
            color="bg-orange-500"
            isLive={false}
          />
        </div>

        {/* Live Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Application Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Application Status</h3>
                <p className="text-sm text-gray-500">Live breakdown of submissions</p>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : totalStatusCount === 0 ? (
              <div className="text-center py-8 text-gray-400">No applications yet</div>
            ) : (
              <div className="space-y-4">
                <StatusBar 
                  label="Pending" 
                  count={stats.applicationsByStatus.pending} 
                  total={totalStatusCount}
                  color="bg-yellow-500"
                  icon={Clock}
                />
                <StatusBar 
                  label="Under Review" 
                  count={stats.applicationsByStatus.review} 
                  total={totalStatusCount}
                  color="bg-blue-500"
                  icon={AlertCircle}
                />
                <StatusBar 
                  label="Approved" 
                  count={stats.applicationsByStatus.completed} 
                  total={totalStatusCount}
                  color="bg-green-500"
                  icon={CheckCircle}
                />
                <StatusBar 
                  label="Rejected" 
                  count={stats.applicationsByStatus.rejected} 
                  total={totalStatusCount}
                  color="bg-red-500"
                  icon={XCircle}
                />
              </div>
            )}
          </div>

          {/* Visitor Locations */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Visitor Locations</h3>
                <p className="text-sm text-gray-500">Live geographic breakdown</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-400">Loading...</div>
            ) : Object.keys(stats.visitorsByCountry).length === 0 ? (
              <div className="text-center py-8 text-gray-400">No visitor data yet</div>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.visitorsByCountry)
                  .sort(([, a], [, b]) => b - a)
                  .map(([country, count]) => {
                    const total = Object.values(stats.visitorsByCountry).reduce((a, b) => a + b, 0);
                    const percent = Math.round((count / total) * 100);
                    return <LocationItem key={country} country={country} count={count} percent={percent} />;
                  })
                }
              </div>
            )}
          </div>
        </div>

        {/* Active Users Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg text-green-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Real-Time Activity</h3>
                <p className="text-sm text-gray-500">Currently active users on the platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="font-bold text-2xl">{stats.activeNow}</span>
              <span className="text-sm text-gray-500">online</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Today's Visitors" value={stats.totalVisitors} />
            <MetricCard label="New Applications" value={stats.applications} />
            <MetricCard label="Pending Review" value={stats.applicationsByStatus.pending} />
            <MetricCard label="Total Revenue" value={`${stats.revenue} QAR`} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon: Icon, color, isLive }: { title: string; value: string; icon: any; color: string; isLive?: boolean }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {isLive && (
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={cn("p-3 rounded-lg text-white shadow-sm", color)}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function StatusBar({ label, count, total, color, icon: Icon }: { label: string; count: number; total: number; color: string; icon: any }) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", color.replace("bg-", "text-"))} />
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <span className="font-bold text-gray-900">{count}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function LocationItem({ country, count, percent }: { country: string; count: number; percent: number }) {
  const getFlag = (country: string) => {
    const flags: Record<string, string> = {
      "Qatar": "🇶🇦",
      "Saudi Arabia": "🇸🇦",
      "UAE": "🇦🇪",
      "Kuwait": "🇰🇼",
      "Bahrain": "🇧🇭",
      "Oman": "🇴🇲",
      "UK": "🇬🇧",
      "USA": "🇺🇸",
    };
    return flags[country] || "🌍";
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-lg">{getFlag(country)}</span>
        <span className="font-medium text-gray-700">{country}</span>
        <span className="text-sm text-gray-400">({count})</span>
      </div>
      <div className="flex items-center gap-3 w-1/2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        <span className="text-sm text-gray-500 w-10 text-right">{percent}%</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg text-center">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
