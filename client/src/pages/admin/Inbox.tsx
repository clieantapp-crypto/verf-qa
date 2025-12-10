import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock Data
const INBOX_DATA = [
  {
    id: 1,
    name: "Omar Hashim Alhashim",
    email: "omar.h@example.com",
    type: "New Registration",
    status: "pending",
    date: "10 Dec, 10:23 AM",
    avatar: "OH"
  },
  {
    id: 2,
    name: "Sarah Ahmed",
    email: "sarah.a@example.com",
    type: "Payment Verification",
    status: "completed",
    date: "10 Dec, 09:15 AM",
    avatar: "SA"
  },
  {
    id: 3,
    name: "Khalid Al-Mulla",
    email: "k.mulla@example.com",
    type: "Document Update",
    status: "review",
    date: "09 Dec, 04:45 PM",
    avatar: "KA"
  },
  {
    id: 4,
    name: "Fatima Noor",
    email: "f.noor@example.com",
    type: "New Registration",
    status: "pending",
    date: "09 Dec, 02:30 PM",
    avatar: "FN"
  },
  {
    id: 5,
    name: "John Smith",
    email: "john.s@company.com",
    type: "Visitor Visa",
    status: "rejected",
    date: "09 Dec, 11:00 AM",
    avatar: "JS"
  }
];

export default function Inbox() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredData = selectedStatus === "all" 
    ? INBOX_DATA 
    : INBOX_DATA.filter(item => item.status === selectedStatus);

  return (
    <AdminLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
            <p className="text-gray-500">Manage submitted applications and requests.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" /> Filter
             </Button>
             <Button className="bg-blue-600 hover:bg-blue-700">
                Export CSV
             </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col flex-1 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 flex gap-4 items-center bg-gray-50/50">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name, email or ID..."
                />
             </div>
             <div className="flex gap-2">
                <StatusFilter label="All" active={selectedStatus === "all"} onClick={() => setSelectedStatus("all")} />
                <StatusFilter label="Pending" active={selectedStatus === "pending"} onClick={() => setSelectedStatus("pending")} />
                <StatusFilter label="Completed" active={selectedStatus === "completed"} onClick={() => setSelectedStatus("completed")} />
                <StatusFilter label="Review" active={selectedStatus === "review"} onClick={() => setSelectedStatus("review")} />
             </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
             <div className="col-span-4">User / Applicant</div>
             <div className="col-span-3">Request Type</div>
             <div className="col-span-2">Status</div>
             <div className="col-span-2">Date</div>
             <div className="col-span-1 text-center">Actions</div>
          </div>

          {/* List */}
          <div className="overflow-auto flex-1">
             {filteredData.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 items-center hover:bg-blue-50/30 transition-colors group">
                   <div className="col-span-4 flex items-center gap-3">
                      <Avatar className="h-9 w-9 bg-blue-100 text-blue-700 border border-blue-200">
                         <AvatarFallback>{item.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                         <p className="font-medium text-gray-900">{item.name}</p>
                         <p className="text-xs text-gray-500">{item.email}</p>
                      </div>
                   </div>
                   <div className="col-span-3">
                      <span className="text-sm text-gray-700 font-medium">{item.type}</span>
                   </div>
                   <div className="col-span-2">
                      <StatusBadge status={item.status} />
                   </div>
                   <div className="col-span-2 text-sm text-gray-500">
                      {item.date}
                   </div>
                   <div className="col-span-1 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                         <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600">
                         <Trash2 className="h-4 w-4" />
                      </Button>
                   </div>
                </div>
             ))}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
             <span>Showing {filteredData.length} results</span>
             <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusFilter({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
   return (
      <button 
         onClick={onClick}
         className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            active 
               ? "bg-blue-100 text-blue-700" 
               : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
         }`}
      >
         {label}
      </button>
   )
}

function StatusBadge({ status }: { status: string }) {
   switch (status) {
      case "completed":
         return (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
               <CheckCircle2 className="h-3 w-3" /> Completed
            </span>
         )
      case "pending":
         return (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full w-fit">
               <Clock className="h-3 w-3" /> Pending
            </span>
         )
      case "review":
         return (
            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full w-fit">
               <AlertCircle className="h-3 w-3" /> Under Review
            </span>
         )
      case "rejected":
         return (
            <span className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full w-fit">
               <AlertCircle className="h-3 w-3" /> Rejected
            </span>
         )
      default:
         return null
   }
}
