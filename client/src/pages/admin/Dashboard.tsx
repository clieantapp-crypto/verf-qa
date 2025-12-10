import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Users, 
  Activity, 
  CreditCard, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const visitorData = [
  { name: '00:00', visitors: 120 },
  { name: '04:00', visitors: 80 },
  { name: '08:00', visitors: 450 },
  { name: '12:00', visitors: 980 },
  { name: '16:00', visitors: 850 },
  { name: '20:00', visitors: 340 },
  { name: '23:59', visitors: 190 },
];

const submissionsData = [
  { name: 'Mon', count: 45 },
  { name: 'Tue', count: 52 },
  { name: 'Wed', count: 38 },
  { name: 'Thu', count: 65 },
  { name: 'Fri', count: 48 },
  { name: 'Sat', count: 25 },
  { name: 'Sun', count: 15 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVisitors: 0,
    activeNow: 0,
    applications: 0,
    revenue: 0,
    visitorsByCountry: {},
    applicationsByStatus: {
      pending: 0,
      completed: 0,
      review: 0,
      rejected: 0,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500">Real-time monitoring of system activity and visitor stats.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Visitors" 
            value={loading ? "..." : stats.totalVisitors.toLocaleString()} 
            change="+12.5%" 
            isPositive={true}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard 
            title="Active Now" 
            value={loading ? "..." : stats.activeNow.toString()} 
            change="+5.2%" 
            isPositive={true}
            icon={Activity}
            color="bg-green-500"
          />
          <StatCard 
            title="Applications" 
            value={loading ? "..." : stats.applications.toLocaleString()} 
            change="-2.1%" 
            isPositive={false}
            icon={CreditCard}
            color="bg-purple-500"
          />
          <StatCard 
            title="Revenue" 
            value={loading ? "..." : `QAR ${(stats.revenue / 1000).toFixed(1)}k`} 
            change="+8.4%" 
            isPositive={true}
            icon={TrendingUp}
            color="bg-orange-500"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Traffic Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900">Live Traffic</h3>
                <p className="text-sm text-gray-500">Visitor traffic over the last 24 hours</p>
              </div>
              <div className="flex gap-2">
                 <span className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live
                 </span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitorData}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Submissions Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-6">
                <h3 className="font-bold text-gray-900">Weekly Applications</h3>
                <p className="text-sm text-gray-500">Submitted forms per day</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={submissionsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Visitors Map / List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Globe className="h-5 w-5" />
                 </div>
                 <h3 className="font-bold text-gray-900">Visitor Locations</h3>
              </div>
              <div className="space-y-4">
                 {loading ? (
                   <p className="text-gray-500 text-sm">Loading...</p>
                 ) : Object.keys(stats.visitorsByCountry).length > 0 ? (
                   Object.entries(stats.visitorsByCountry)
                     .sort(([, a], [, b]) => b - a)
                     .slice(0, 4)
                     .map(([country, count]) => {
                       const total = Object.values(stats.visitorsByCountry).reduce((a, b) => a + b, 0);
                       const percent = Math.round((count / total) * 100);
                       return <LocationItem key={country} country={country} count={count} percent={percent} />;
                     })
                 ) : (
                   <p className="text-gray-500 text-sm">No visitor data yet</p>
                 )}
              </div>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                    <Users className="h-5 w-5" />
                 </div>
                 <h3 className="font-bold text-gray-900">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                 <ActivityItem user="Ahmed Al-Sayed" action="Submitted new application" time="2 mins ago" />
                 <ActivityItem user="Fatima Khalil" action="Updated profile details" time="15 mins ago" />
                 <ActivityItem user="Guest User" action="Viewed payment page" time="32 mins ago" />
                 <ActivityItem user="System" action="Daily backup completed" time="1 hour ago" />
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, change, isPositive, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <div className={cn("flex items-center mt-2 text-xs font-medium", isPositive ? "text-green-600" : "text-red-600")}>
          {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          {change} from last month
        </div>
      </div>
      <div className={cn("p-3 rounded-lg text-white shadow-sm", color)}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

function LocationItem({ country, count, percent }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-lg">
                    {country === "Qatar" ? "🇶🇦" : country === "Saudi Arabia" ? "🇸🇦" : country === "UAE" ? "🇦🇪" : "🇬🇧"}
                </span>
                <span className="font-medium text-gray-700">{country}</span>
            </div>
            <div className="flex items-center gap-3 w-1/2">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <span className="text-sm text-gray-500 w-8 text-right">{percent}%</span>
            </div>
        </div>
    )
}

function ActivityItem({ user, action, time }: any) {
    return (
        <div className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                {user.charAt(0)}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-900">{user}</p>
                <p className="text-xs text-gray-500">{action}</p>
            </div>
            <span className="ml-auto text-xs text-gray-400">{time}</span>
        </div>
    )
}
