import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import Reservation from "@/pages/Reservation";
import Contact from "@/pages/Contact";
import AuthPage from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Dashboard from "@/pages/admin/Dashboard";
import Scan from "@/pages/Scan";
import { Footer } from "@/components/Footer";
import { Navigation } from "@/components/Navigation";

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function AdminLayout({ children }) {
  return (
    <main className="min-h-screen">
      {children}
    </main>
  );
}

function Router() {
  return <Switch>
    {/* Public Pages */}
    <Route path="/">
      <PublicLayout><Home /></PublicLayout>
    </Route>
    <Route path="/menu">
      <PublicLayout><Menu /></PublicLayout>
    </Route>
    <Route path="/reservation">
      <PublicLayout><Reservation /></PublicLayout>
    </Route>
    <Route path="/contact">
      <PublicLayout><Contact /></PublicLayout>
    </Route>
    <Route path="/scan">
      <PublicLayout><Scan /></PublicLayout>
    </Route>
    <Route path="/auth">
      <PublicLayout><AuthPage /></PublicLayout>
    </Route>
    <Route path="/profile">
      <PublicLayout><Profile /></PublicLayout>
    </Route>

    {/* Admin Pages */}
    <Route path="/admin/login">
      <AdminLayout><AuthPage /></AdminLayout>
    </Route>
    <Route path="/admin/dashboard">
      <AdminLayout><Dashboard /></AdminLayout>
    </Route>
    <Route path="/admin/orders">
      <AdminLayout><Dashboard /></AdminLayout>
    </Route>
    <Route path="/admin/menu">
      <AdminLayout><Dashboard /></AdminLayout>
    </Route>
    <Route path="/admin/offers">
      <AdminLayout><Dashboard /></AdminLayout>
    </Route>
    <Route path="/admin/reservations">
      <AdminLayout><Dashboard /></AdminLayout>
    </Route>
    <Route path="/admin/customers">
      <AdminLayout><Dashboard /></AdminLayout>
    </Route>
    <Route path="/admin/payments">
      <AdminLayout><Dashboard /></AdminLayout>
    </Route>

    <Route>
      <PublicLayout><NotFound /></PublicLayout>
    </Route>
  </Switch>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
var stdin_default = App;
export {
  stdin_default as default
};
