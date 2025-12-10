import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import PaymentGateway from "@/pages/PaymentGateway";

import Dashboard from "@/pages/admin/Dashboard";
import AdminLogin from "@/pages/admin/AdminLogin";
import Inbox from "@/pages/admin/Inbox";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/payment" component={PaymentGateway} />
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/inbox" component={Inbox} />
      <Route path="/admin/visitors" component={Dashboard} />{" "}
      {/* Re-using dashboard for visitors demo */}
      <Route path="/admin/settings" component={Dashboard} />{" "}
      {/* Re-using dashboard for settings demo */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans" dir="rtl">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;
