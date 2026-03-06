import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useEffect, useState, useMemo, Fragment } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Utensils,
  CalendarDays,
  LogOut,
  Clock,
  CheckCircle2,
  ChefHat,
  IndianRupee,
  Bell,
  Menu as MenuIcon,
  X,
  Smartphone,
  ChevronRight,
  ClipboardList,
  Users,
  User,
  CreditCard,
  TrendingUp,
  BarChart3,
  Search,
  ShoppingBag,
  ChevronDown,
  QrCode,
  Banknote,
  FileDown,
  Phone,
  Calendar,
  Percent,
  MessageSquare
} from "lucide-react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { useReservations, useUpdateReservationStatus } from "@/hooks/use-reservations";
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import AdminMenu from "./AdminMenu";
import AdminOffers from "./AdminOffers";
import AdminReservations from "./AdminReservations";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import QRCode from "qrcode";
import { generateBillPDF } from "@/lib/bill-pdf";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { Input } from "@/components/ui/input";

function Dashboard() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: reservations } = useReservations();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationLastViewed, setNotificationLastViewed] = useState(() => {
    const saved = localStorage.getItem("parsik_admin_notifications_viewed");
    return saved ? parseInt(saved) : 0;
  });

  const notifications = useMemo(() => {
    const items = [];
    if (orders) {
      orders.forEach(order => {
        items.push({
          id: `order-${order.id}`,
          type: 'order',
          title: `New Order: #${order.id.toString().slice(-4)}`,
          customerName: order.customerName,
          details: `₹${Number(order.totalAmount).toFixed(2)} • ${order.paymentMethod}`,
          timestamp: new Date(order.createdAt).getTime(),
          isRead: new Date(order.createdAt).getTime() <= notificationLastViewed
        });
      });
    }
    if (reservations) {
      reservations.forEach(res => {
        items.push({
          id: `res-${res.id}`,
          type: 'reservation',
          title: 'Table Booking',
          customerName: res.customerName,
          details: `${res.guestCount} Guests • ${res.date ? format(new Date(res.date), "MMM do") : "N/A"} at ${res.time} • ${res.phoneNumber}`,
          timestamp: new Date(res.createdAt || Date.now()).getTime(),
          isRead: new Date(res.createdAt || Date.now()).getTime() <= notificationLastViewed
        });
      });
    }
    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20); // Keep last 20
  }, [orders, reservations, notificationLastViewed]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationsViewed = (open) => {
    if (open) {
      const now = Date.now();
      setNotificationLastViewed(now);
      localStorage.setItem("parsik_admin_notifications_viewed", now.toString());
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/admin/login");
    }
  }, [user, authLoading, setLocation]);

  if (authLoading || !user) return null;

  const activeTab = location === "/admin/dashboard" ? "analytics" :
    location.includes("orders") ? "orders" :
      location.includes("menu") ? "menu" :
        location.includes("offers") ? "offers" :
          location.includes("reservations") ? "bookings" :
            location.includes("customers") ? "customers" :
              location.includes("payments") ? "payments" : "analytics";

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return <div className="space-y-10"><Analytics orders={orders} reservations={reservations} /></div>;
      case "menu":
        return <AdminMenu />;
      case "offers":
        return <AdminOffers />;
      case "bookings":
        return <AdminReservations />;
      case "customers":
        return <CustomerDetails orders={orders} reservations={reservations} />;
      case "payments":
        return <PaymentsView orders={orders} />;
      case "orders":
        return <LiveOrdersView orders={orders} isLoading={ordersLoading} />;
      default:
        return <div className="space-y-10"><Analytics orders={orders} reservations={reservations} /></div>;
    }
  };

  const navLinks = [
    { href: "/admin/dashboard", icon: <LayoutDashboard size={14} />, label: "Dashboard", id: "analytics" },
    { href: "/admin/orders", icon: <ClipboardList size={14} />, label: "Orders", id: "orders" },
    { href: "/admin/menu", icon: <Utensils size={14} />, label: "Menu List", id: "menu" },
    { href: "/admin/offers", icon: <Percent size={14} />, label: "Offers", id: "offers" },
    { href: "/admin/reservations", icon: <CalendarDays size={14} />, label: "Bookings", id: "bookings" },
    { href: "/admin/customers", icon: <Users size={14} />, label: "Customer Details", id: "customers" },
    { href: "/admin/payments", icon: <CreditCard size={14} />, label: "Payments", id: "payments" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-border/40">
      <div className="p-8 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2.5 mb-8 focus:outline-none group">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:rotate-6 transition-all">P</div>
          <span className="font-display text-2xl text-primary font-normal">Parsik <span className="text-accent italic">elite</span></span>
        </Link>
        <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-border/40 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-[10px] shadow-md uppercase">
            {user.username.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5 opacity-60">System Operations</p>
            <p className="text-xs font-semibold truncate text-primary/80 leading-none tracking-tight">{user.username}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-5 space-y-1.5">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all cursor-pointer text-[11px] font-semibold tracking-wide ${location === link.href || (link.id === "analytics" && location === "/admin/dashboard")
                ? "bg-primary text-white shadow-xl shadow-primary/20"
                : "text-muted-foreground hover:bg-muted/50 hover:text-primary"
                }`}
            >
              <span className="opacity-70 group-hover:opacity-100">{link.icon}</span>
              {link.label}
              {(location === link.href || (link.id === "analytics" && location === "/admin/dashboard")) && <ChevronRight className="ml-auto w-3 h-3 opacity-50" />}
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-border/40">
        <Button
          variant="ghost"
          className="w-full justify-start gap-4 h-12 px-5 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold text-[11px] tracking-wide transition-colors"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex selection:bg-accent/20">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 fixed h-full z-40 bg-white shadow-sm">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col relative w-full overflow-x-hidden">
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden h-11 w-11 rounded-xl bg-muted/30">
                  <MenuIcon className="w-5 h-5 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-none">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="hidden sm:block">
              <h2 className="text-[10px] font-black text-muted-foreground tracking-[0.3em] uppercase italic opacity-40">Administrative Protocol</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Operational Status</span>
              <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Real-time Link Active
              </span>
            </div>

            <Popover onOpenChange={handleNotificationsViewed}>
              <PopoverTrigger asChild>
                <div className="w-10 h-10 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-center relative hover:bg-muted/50 transition-colors cursor-pointer">
                  <Bell className="w-4 h-4 text-primary/40" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-accent rounded-full border border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-white px-1">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-2xl shadow-xl border-border/40" align="end" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/10 rounded-t-2xl">
                  <h4 className="text-sm font-bold text-primary">Notifications</h4>
                  {unreadCount > 0 && (
                    <Badge className="bg-primary/10 text-primary border-none text-[10px]">
                      {unreadCount} New
                    </Badge>
                  )}
                </div>
                <ScrollArea className="h-[350px]">
                  {notifications.length > 0 ? (
                    <div className="flex flex-col">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-border/40 last:border-b-0 hover:bg-muted/30 transition-colors flex gap-3 ${!notif.isRead ? 'bg-accent/5' : ''}`}
                        >
                          <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${notif.type === 'order' ? 'bg-blue-500/10 text-blue-600' : 'bg-green-500/10 text-green-600'}`}>
                            {notif.type === 'order' ? <Utensils className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-xs font-bold text-primary leading-tight">{notif.title}</p>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">{format(notif.timestamp, "h:mm a")}</span>
                            </div>
                            <p className="text-[11px] font-semibold text-primary/80 mb-0.5">{notif.customerName}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{notif.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                      <Bell className="w-8 h-8 opacity-20 mb-2" />
                      <p className="text-xs font-medium">No recent notifications</p>
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <div className="p-4 sm:p-6 md:p-10 flex-1">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

function Analytics({ orders, reservations }) {
  const peakHoursData = useMemo(() => {
    if (!orders) return [];
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      orders: 0
    }));
    orders.forEach(order => {
      const date = parseISO(order.createdAt);
      const hour = date.getHours();
      hours[hour].orders += 1;
    });
    return hours.filter(h => h.orders > 0 || (parseInt(h.hour) > 8 && parseInt(h.hour) < 22));
  }, [orders]);

  const dailyStats = useMemo(() => {
    if (!orders) return { revenue: 0, count: 0, pending: 0 };
    const today = new Date();
    const todayOrders = orders.filter(o =>
      isWithinInterval(parseISO(o.createdAt), {
        start: startOfDay(today),
        end: endOfDay(today)
      })
    );
    return {
      revenue: todayOrders.reduce((acc, o) => acc + Number(o.totalAmount), 0),
      count: todayOrders.length,
      pending: todayOrders.filter(o => o.status === "pending").length
    };
  }, [orders]);

  const pendingOrders = useMemo(() => {
    if (!orders) return [];
    return orders
      .filter(o => o.status === "pending" || o.status === "preparing")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders]);

  const recentReservations = useMemo(() => {
    if (!reservations) return [];
    return reservations
      .filter(r => r.status === "upcoming")
      .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
  }, [reservations]);

  const updateOrderStatus = useUpdateOrderStatus();
  const updateReservationStatus = useUpdateReservationStatus();

  return (
    <div className="space-y-8 mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Today's Intake" value={`₹${dailyStats.revenue}`} color="bg-accent" icon={<IndianRupee className="w-4 h-4" />} trend="+12% vs yest" />
        <StatCard label="Orders Today" value={dailyStats.count} color="bg-primary" icon={<Utensils className="w-4 h-4" />} trend="+5 new" />
        <StatCard label="Pending Processing" value={dailyStats.pending} color="bg-indigo-600" icon={<Clock className="w-4 h-4" />} />
        <StatCard label="Live Occupancy" value="78%" color="bg-emerald-600" icon={<TrendingUp className="w-4 h-4" />} trend="Stable" />
      </div>

      {/* New Row: Pending Orders & Reservations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Orders Table */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-border/40 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Pending Orders</h4>
              <p className="text-[10px] text-muted-foreground font-bold italic opacity-60">Active kitchen pipeline</p>
            </div>
            <Badge className="bg-accent/10 border-none text-accent">
              {pendingOrders.length}
            </Badge>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
            <div className="space-y-3">
              {pendingOrders.map(order => (
                <div key={order.id} className="flex flex-col gap-3 p-4 rounded-2xl border border-border/50 bg-secondary/10 hover:bg-secondary/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-primary text-sm">#{order.id.toString().slice(-4)}</span>
                      <p className="font-semibold text-primary/80 text-xs mt-0.5">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-accent text-sm">₹{Number(order.totalAmount).toFixed(2)}</span>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5"><StatusBadge status={order.status} /></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <Button size="sm" onClick={() => updateOrderStatus.mutate({ id: order.id, status: "preparing" })} className="flex-1 h-8 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors">
                        Mark Preparing
                      </Button>
                    )}
                    {order.status === "preparing" && (
                      <Button size="sm" onClick={() => updateOrderStatus.mutate({ id: order.id, status: "served" })} className="flex-1 h-8 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors">
                        Mark Served
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {pendingOrders.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white/50 rounded-2xl border border-dashed border-border/40">
                  <span className="text-primary/20 font-bold uppercase tracking-[0.2em] text-xs italic">No Pending Orders</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-border/40 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Reservations</h4>
              <p className="text-[10px] text-muted-foreground font-bold italic opacity-60">Upcoming scheduled entries</p>
            </div>
            <Badge className="bg-primary/10 border-none text-primary">
              {recentReservations.length}
            </Badge>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
            <div className="space-y-4">
              {recentReservations.map(res => (
                <div key={res.id} className="p-4 rounded-2xl border border-border/50 bg-secondary/10 hover:bg-secondary/30 transition-colors space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold text-primary text-sm leading-tight">{res.customerName}</h5>
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" /> {res.phoneNumber}
                      </span>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-widest bg-white">
                        <Users className="w-3 h-3 mr-1" /> {res.guestCount}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-primary/70 font-semibold bg-white p-2 rounded-xl border border-border/40">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>{res.date ? format(new Date(res.date), "MMM do") : "N/A"}</span>
                    <span className="text-border/60 mx-1">•</span>
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>{res.time}</span>
                  </div>

                  {res.specialRequests && (
                    <p className="text-[10px] text-muted-foreground italic border-l-2 border-accent/30 pl-2 py-0.5">
                      "{res.specialRequests}"
                    </p>
                  )}

                  <div className="flex gap-2 pt-1 border-t border-border/30">
                    <Button
                      size="sm"
                      onClick={() => updateReservationStatus.mutate({ id: res.id, status: "completed" })}
                      className="flex-1 h-8 bg-primary hover:bg-primary/90 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm"
                    >
                      Process Arrival
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateReservationStatus.mutate({ id: res.id, status: "cancelled" })}
                      className="flex-1 h-8 text-destructive hover:bg-destructive/10 rounded-xl text-[9px] font-black uppercase tracking-widest border border-destructive/20"
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
              {recentReservations.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white/50 rounded-2xl border border-dashed border-border/40">
                  <span className="text-primary/20 font-bold uppercase tracking-[0.2em] text-xs italic">No Upcoming Entries</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Peak Service Correlation</h4>
              <p className="text-[10px] text-muted-foreground font-bold italic opacity-60">Orders distribution by hour</p>
            </div>
            <BarChart3 className="w-5 h-5 text-accent opacity-20" />
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={peakHoursData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, opacity: 0.4 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, opacity: 0.4 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="orders" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2">Branch Performance</h4>
          <p className="text-[10px] text-muted-foreground font-bold italic opacity-60 mb-8">Revenue distribution by outlet</p>
          <div className="space-y-6">
            <BranchStat label="Airoli Knowledge Park" value="₹42,800" progress={80} color="bg-accent" />
            <BranchStat label="Thane Platinum" value="₹28,400" progress={55} color="bg-primary" />
            <BranchStat label="Powai Elite" value="₹12,200" progress={25} color="bg-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BranchStat({ label, value, progress, color }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase tracking-tight text-primary/70">{label}</span>
        <span className="text-xs font-black text-primary italic">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

function LiveOrdersView({ orders, isLoading }) {
  const updateStatus = useUpdateOrderStatus();
  const [selectedOrderForCash, setSelectedOrderForCash] = useState(null);
  const [selectedOrderForUPI, setSelectedOrderForUPI] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(order => {
      const nameMatch = order.customerName.toLowerCase().includes(searchName.toLowerCase());
      const idMatch = order.id.toString().includes(searchOrderId);
      return nameMatch && idMatch;
    });
  }, [orders, searchName, searchOrderId]);

  const sortedOrders = useMemo(() => {
    const statusWeight = {
      checkout_requested: 0,
      active: 1,
      pending: 2,
      preparing: 3,
      served: 4,
      completed: 5
    };

    return [...filteredOrders].sort((a, b) => {
      if (statusWeight[a.status] !== statusWeight[b.status]) {
        return (statusWeight[a.status] ?? 99) - (statusWeight[b.status] ?? 99);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredOrders]);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-accent rounded-full animate-spin" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/30 italic">Synchronizing Fleet...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display text-primary tracking-tight italic">Live Orders</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Real-time Service Management</p>
        </div>
        <Badge className="bg-primary/5 text-primary border-primary/10 text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
          Queue Length: {filteredOrders.length} {filteredOrders.length !== (orders?.length || 0) && `/ Total: ${orders?.length || 0}`}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input
            className="h-12 pl-12 rounded-2xl border-border/40 bg-white shadow-sm font-bold text-xs"
            placeholder="Search by Customer Name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input
            className="h-12 pl-12 rounded-2xl border-border/40 bg-white shadow-sm font-bold text-xs"
            placeholder="Search by Order ID..."
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-border/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="border-b border-border/40 bg-muted/20">
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Order ID</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Customer</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">Contact & Table</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right whitespace-nowrap">Amount</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center whitespace-nowrap">Status</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-12px_0_15px_-5px_rgba(0,0,0,0.05)] border-l border-border/40">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-sans">
              <AnimatePresence mode="popLayout" initial={false}>
                {sortedOrders?.map((order) => (
                  <Fragment key={order.id}>
                    <motion.tr
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span className="font-bold text-primary italic">#{order.id.toString().slice(-4)}</span>
                        <p className="text-[9px] font-bold uppercase text-muted-foreground opacity-40 mt-1">{format(new Date(order.createdAt), "h:mm a")}</p>
                      </td>
                      <td className="px-6 py-6 min-w-[150px]">
                        <div className="font-semibold text-primary whitespace-normal line-clamp-2">{order.customerName}</div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-[10px] font-medium text-muted-foreground opacity-60">{order.phoneNumber}</div>
                        <div className="text-[9px] font-bold uppercase text-accent mt-1 italic">
                          {order.tableNumber ? `Table ${order.tableNumber}` : "Express"}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right whitespace-nowrap">
                        <span className="font-bold text-primary italic">₹{Number(order.totalAmount).toFixed(2)}</span>
                        <p className="text-[9px] uppercase font-bold text-muted-foreground opacity-40 mt-0.5">{order.paymentMethod}</p>
                      </td>
                      <td className="px-6 py-6 text-center whitespace-nowrap min-w-[140px]">
                        <div className="flex flex-col items-center gap-2">
                          <StatusBadge status={order.status} />
                          {order.status === "active" && (
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Ordering...</span>
                          )}
                          {order.status === "checkout_requested" && (
                            <Button size="sm" onClick={() => {
                              if (order.paymentMethod === 'cash') setSelectedOrderForCash(order);
                              else setSelectedOrderForUPI(order);
                            }} className="h-7 mt-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-lg text-[9px] font-bold uppercase tracking-widest px-3 transition-colors w-full shrink-0 animate-pulse">
                              Collect Payment
                            </Button>
                          )}
                          {order.status === "pending" && (
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: order.id, status: "preparing" })} className="h-7 mt-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-[9px] font-bold uppercase tracking-widest px-3 transition-colors w-full shrink-0">
                              Mark Preparing
                            </Button>
                          )}
                          {order.status === "preparing" && (
                            <Button size="sm" onClick={() => updateStatus.mutate({ id: order.id, status: "served" })} className="h-7 mt-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 rounded-lg text-[9px] font-bold uppercase tracking-widest px-3 transition-colors w-full shrink-0">
                              Mark Served
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-[#f8f9fa] transition-colors z-10 shadow-[-12px_0_15px_-5px_rgba(0,0,0,0.03)] border-l border-border/40">
                        <div className="flex justify-end items-center gap-2">
                          {order.status !== "completed" && order.status !== "active" && order.status !== "pending" && order.status !== "preparing" && (
                            <div className="flex bg-secondary/50 p-1 rounded-2xl border border-border/40">
                              <Button
                                size="sm"
                                onClick={() => setSelectedOrderForCash(order)}
                                className="bg-white hover:bg-accent hover:text-white text-accent h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm transition-all shrink-0"
                              >
                                <Banknote className="w-3.5 h-3.5 mr-1.5" /> Cash
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setSelectedOrderForUPI(order)}
                                className="bg-transparent hover:bg-indigo-600 hover:text-white text-indigo-600 h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0"
                              >
                                <QrCode className="w-3.5 h-3.5 mr-1.5" /> Online
                              </Button>
                            </div>
                          )}
                          {order.status === "completed" && (
                            <div className="flex items-center gap-3 mr-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-60 shrink-0" />
                              <Button
                                size="sm"
                                onClick={() => generateBillPDF(order, orders)}
                                className="bg-slate-800 hover:bg-slate-900 text-white h-8 px-4 rounded-[0.75rem] text-[9px] font-bold uppercase tracking-widest shadow-md shadow-slate-800/20 transition-all shrink-0"
                              >
                                <FileDown className="w-3.5 h-3.5 mr-1.5" /> Bill
                              </Button>
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleOrderDetails(order.id)}
                            className={`h-8 w-8 p-0 rounded-[0.75rem] transition-all shrink-0 border-border/60 hover:bg-secondary/80 hover:border-border ${expandedOrders[order.id] ? 'bg-secondary/50 border-border shadow-inner' : 'bg-white shadow-sm'}`}
                            title="Toggle Order Details"
                          >
                            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${expandedOrders[order.id] ? "rotate-180" : ""}`} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expandable Order Details Row */}
                    {expandedOrders[order.id] && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-secondary/10 border-b border-border/40"
                      >
                        <td colSpan={6} className="p-0">
                          <div className="p-6 bg-[#fcfcfc] shadow-inner border-y border-border/20">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <Utensils className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Itemized Order Summary</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white rounded-xl border border-border/40 p-4">
                                <ul className="space-y-3">
                                  {order.items?.map((item, idx) => (
                                    <li key={idx} className="flex justify-between items-center text-sm border-b border-border/20 pb-2 last:border-0 last:pb-0">
                                      <span className="font-medium text-foreground flex items-center gap-2">
                                        <Badge variant="outline" className="bg-muted/10 text-[10px] w-6 justify-center px-0">{item.quantity}x</Badge>
                                        {item.dishName || item.menuItem?.name}
                                      </span>
                                      <span className="text-primary font-bold">₹{((item.price) * item.quantity).toFixed(2)}</span>
                                    </li>
                                  ))}
                                </ul>
                                
                                {order.specialRequests && (
                                  <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/50 flex gap-3 items-start">
                                    <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                    <div>
                                      <span className="block text-[9px] font-black uppercase tracking-widest text-amber-800 mb-1">Cooking Instructions</span>
                                      <p className="text-[11px] font-medium text-amber-900/80 leading-relaxed italic">{order.specialRequests}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="mt-4 pt-3 flex justify-between items-center border-t border-border/50">
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Paid</span>
                                  <span className="text-lg font-black text-accent">₹{Number(order.totalAmount).toFixed(2)}</span>
                                </div>
                              </div>

                              <div className="bg-white rounded-xl border border-border/40 p-4 flex flex-col justify-center">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Reference</span>
                                    <span className="font-mono bg-muted/20 px-2 py-0.5 rounded text-primary font-medium">{order.id}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Completion Time</span>
                                    <span className="font-medium text-foreground">{format(new Date(order.createdAt), "dd MMM yyyy, h:mm a")}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Payment Route</span>
                                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest font-black">
                                      {order.status === "completed" ? order.paymentMethod : "Pending"}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </Fragment>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {orders?.length === 0 && (
            <div className="py-24 text-center bg-white border-t border-border/40 flex flex-col items-center justify-center gap-4">
              <ShoppingBag className="w-12 h-12 text-primary/5" />
              <p className="text-primary/20 font-bold uppercase tracking-[0.4em] text-[10px] italic">No active traffic monitored</p>
            </div>
          )}
        </div>
      </div>

      <CashPaymentModal order={selectedOrderForCash} allOrders={orders} onClose={() => setSelectedOrderForCash(null)} />
      <OnlinePaymentModal order={selectedOrderForUPI} allOrders={orders} onClose={() => setSelectedOrderForUPI(null)} />
    </div>
  );
}

function CashPaymentModal({ order, allOrders, onClose }) {
  const [received, setReceived] = useState("");
  const updateStatus = useUpdateOrderStatus();

  if (!order) return null;

  const billAmount = Number(order.totalAmount);
  const receivedAmount = Number(received) || 0;
  const change = Math.max(0, receivedAmount - billAmount);

  const handlePaid = () => {
    updateStatus.mutate({ id: order.id, status: "completed", paymentStatus: "paid" }, {
      onSuccess: () => onClose()
    });
  };

  const handleCreatePdf = () => {
    generateBillPDF(order, allOrders);
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] border-none rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] p-0 overflow-hidden bg-[#faf9f8] flex flex-col">
        {/* Header - High Gloss */}
        <div className="p-6 bg-white border-b border-border/40 relative overflow-hidden backdrop-blur-xl shrink-0">
          <div className="relative z-10 flex flex-col items-center text-center space-y-1">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-1 shadow-inner border border-accent/20">
              <Banknote className="w-6 h-6 text-accent drop-shadow-sm" />
            </div>
            <DialogTitle className="text-2xl font-display font-black text-primary tracking-tight">
              Cash Settlement
            </DialogTitle>
            <DialogDescription className="text-[9px] uppercase font-black tracking-[0.3em] text-muted-foreground/80">
              Desk Transaction • Workspace
            </DialogDescription>
          </div>
          {/* Subtle flare effect */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-[3rem] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/5 rounded-full blur-[3rem] pointer-events-none" />
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Customer info card - sculptural */}
          <div className="flex items-center justify-between bg-white p-4 rounded-[1.25rem] border border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/[0.02] to-transparent" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-primary/5 rounded-[1rem] flex items-center justify-center text-primary font-black text-lg font-display">
                {order.customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">Guest Order</p>
                <p className="font-bold text-primary text-[15px] leading-none">{order.customerName}</p>
              </div>
            </div>
            <div className="text-right border-l border-border/40 pl-5 relative z-10">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">Routing</p>
              <p className="font-bold text-primary text-[15px] leading-none">{order.tableNumber ? `Table ${order.tableNumber}` : "Express"}</p>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="bg-white/60 backdrop-blur-md rounded-[1.25rem] border border-border/50 p-4 shadow-sm space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 border-b border-border/40 pb-2">Order Summary</p>
            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-[0.5rem]">{item.quantity}x</span>
                    <span className="text-xs font-bold text-primary/80">{item.dishName || item.menuItem?.name || "Item"}</span>
                  </div>
                  <span className="text-xs font-black text-accent">₹{(Number(item.price || item.menuItem?.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {/* Bill Amount - high contrast display */}
            <div className="flex flex-col items-center justify-center py-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1">Total Authorized Value</span>
              <span className="font-display font-black text-primary text-[2.5rem] leading-none drop-shadow-sm">₹{billAmount.toFixed(2)}</span>
            </div>

            {/* Input - sophisticated structure */}
            <div className="space-y-4 px-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 ml-2">Tendered Cash (₹)</label>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 font-black text-xl transition-colors group-focus-within:text-accent">₹</span>
                  <Input
                    type="number"
                    value={received}
                    onChange={(e) => setReceived(e.target.value)}
                    className="h-[4.5rem] pl-14 text-2xl font-black bg-white border-border/80 rounded-[1.5rem] focus-visible:ring-accent focus-visible:border-accent shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all placeholder:text-muted-foreground/30"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Enhanced Change Section */}
              <AnimatePresence>
                {receivedAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-4 rounded-[1.25rem] flex items-center justify-between border ${receivedAmount >= billAmount
                      ? "bg-accent/5 border-accent/20"
                      : "bg-destructive/5 border-destructive/20"
                      }`}>
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${receivedAmount >= billAmount ? "text-accent/80" : "text-destructive"
                          }`}>
                          {receivedAmount >= billAmount ? "Change to Return" : "Insufficient Funds"}
                        </span>
                        {receivedAmount < billAmount && (
                          <span className="text-xs font-bold text-destructive/80 mt-1">
                            Missing ₹{(billAmount - receivedAmount).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`font-display font-black text-2xl ${receivedAmount >= billAmount ? "text-accent" : "text-destructive"
                          }`}>
                          ₹{change.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <DialogFooter className="bg-white p-5 border-t border-border/40 flex flex-col sm:flex-row gap-3 shrink-0">
          <Button variant="outline" onClick={handleCreatePdf} className="rounded-[1rem] font-black uppercase tracking-widest text-[10px] h-12 border-primary/20 text-primary hover:bg-secondary sm:w-1/3 transition-all hover:border-primary/40">
            PDF Bill
          </Button>
          <Button onClick={handlePaid} className="rounded-[1rem] font-black uppercase tracking-[0.2em] text-[10px] h-12 sm:flex-1 bg-primary hover:bg-primary/95 text-white shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.02] active:scale-95 group">
            Complete Transfer <CheckCircle2 className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OnlinePaymentModal({ order, allOrders, onClose }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [paymentMode, setPaymentMode] = useState("upi"); // 'upi' or 'card'
  const updateStatus = useUpdateOrderStatus();

  if (!order) return null;

  const billAmount = Number(order.totalAmount);
  // Default to a Parsik Cafe Demo UPI ID
  const upiId = "parsikcafe@upi";
  const upiString = `upi://pay?pa=${upiId}&pn=Parsik%20Cafe&am=${billAmount.toFixed(2)}&cu=INR`;

  const handleGenerateQR = async () => {
    try {
      const url = await QRCode.toDataURL(upiString, { width: 220, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } });
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaid = () => {
    updateStatus.mutate({ id: order.id, status: "completed", paymentStatus: "paid" }, {
      onSuccess: () => onClose()
    });
  };

  const handleCreatePdf = () => {
    generateBillPDF(order, allOrders);
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] border-none rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(30,27,75,0.3)] p-0 overflow-hidden bg-[#faf9f8] flex flex-col">
        {/* Header - Deep Indigo Premium */}
        <div className="p-6 bg-indigo-950 text-white relative overflow-hidden shrink-0">
          <div className="relative z-10 flex flex-col items-center text-center space-y-1">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-1 shadow-inner border border-indigo-400/30 backdrop-blur-md">
              <CreditCard className="w-6 h-6 text-indigo-300 drop-shadow-[0_0_10px_rgba(165,180,252,0.5)]" />
            </div>
            <DialogTitle className="text-2xl font-display font-black tracking-tight text-white drop-shadow-sm">
              Digital Interface
            </DialogTitle>
            <DialogDescription className="text-[9px] uppercase font-black tracking-[0.3em] text-indigo-300/80">
              Secure Encrypted Link
            </DialogDescription>
          </div>
          {/* Abstract glows */}
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-indigo-600/40 rounded-full blur-[3rem] pointer-events-none mix-blend-screen" />
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/20 rounded-full blur-[3rem] pointer-events-none mix-blend-screen" />
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Toggle Engine */}
          <div className="flex bg-secondary/80 p-1.5 rounded-[1.25rem] relative shadow-inner border border-border/40">
            <button
              onClick={() => setPaymentMode("upi")}
              className={`relative z-10 flex-1 transition-all duration-300 rounded-[1rem] py-3 text-[9px] font-black uppercase tracking-[0.2em] ${paymentMode === "upi" ? "text-indigo-900 drop-shadow-sm" : "text-muted-foreground hover:text-primary"}`}
            >
              UPI Express
            </button>
            <button
              onClick={() => setPaymentMode("card")}
              className={`relative z-10 flex-1 transition-all duration-300 rounded-[1rem] py-3 text-[9px] font-black uppercase tracking-[0.2em] ${paymentMode === "card" ? "text-indigo-900 drop-shadow-sm" : "text-muted-foreground hover:text-primary"}`}
            >
              Card Terminal
            </button>
            {/* Sliding background pill */}
            <div
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-[1rem] shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-border/50 transition-transform duration-500 ease-in-out"
              style={{ transform: paymentMode === "card" ? "translateX(calc(100% + 12px))" : "translateX(0)" }}
            />
          </div>

          {/* Customer info card - sculptural */}
          <div className="flex items-center justify-between bg-white p-4 rounded-[1.25rem] border border-border/50 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-600/[0.02] to-transparent" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-indigo-50 rounded-[1rem] flex items-center justify-center text-indigo-900 font-black text-lg font-display">
                {order.customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">Guest Order</p>
                <p className="font-bold text-primary text-[15px] leading-none">{order.customerName}</p>
              </div>
            </div>
            <div className="text-right border-l border-border/40 pl-4 relative z-10">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-0.5">Routing</p>
              <p className="font-bold text-primary text-[15px] leading-none">{order.tableNumber ? `Table ${order.tableNumber}` : "Express"}</p>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="bg-white/60 backdrop-blur-md rounded-[1.25rem] border border-border/50 p-4 shadow-sm space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 border-b border-border/40 pb-2">Order Summary</p>
            <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-[0.5rem]">{item.quantity}x</span>
                    <span className="text-xs font-bold text-primary/80">{item.dishName || item.menuItem?.name || "Item"}</span>
                  </div>
                  <span className="text-xs font-black text-accent">₹{(Number(item.price || item.menuItem?.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-1 border-b border-border/40 pb-5">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 mb-1">Total Authorization</span>
            <span className="font-display font-black text-primary text-[2.5rem] leading-none drop-shadow-sm">₹{billAmount.toFixed(2)}</span>
          </div>

          {/* Action Interface Zone - frosted glass */}
          <div className="flex flex-col items-center justify-center p-6 bg-white/60 backdrop-blur-md border border-indigo-900/10 rounded-[1.5rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] min-h-[200px]">
            {paymentMode === "upi" ? (
              qrCodeUrl ? (
                <div className="flex flex-col items-center animate-in zoom-in-95 duration-500 fade-in">
                  <div className="bg-white p-3 rounded-[1.25rem] shadow-xl border border-border/40 mb-4 pb-4">
                    <img src={qrCodeUrl} alt="UPI QR Code" className="w-[150px] h-[150px] rounded-[0.75rem] object-contain mx-auto" />
                    <div className="w-full flex items-center justify-center gap-2 mt-4 opacity-50">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <div className="w-1 h-1 rounded-full bg-primary" />
                    </div>
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-primary/70">Scan via any UPI App</p>
                </div>
              ) : (
                <Button onClick={handleGenerateQR} className="bg-indigo-950 hover:bg-indigo-900 text-white shadow-xl shadow-indigo-900/30 rounded-[1rem] px-6 h-12 font-black uppercase tracking-[0.2em] text-[9px] transition-all hover:scale-[1.02] active:scale-95 group">
                  <QrCode className="w-4 h-4 mr-2 opacity-70 group-hover:opacity-100 transition-opacity" /> Extract Payment QR
                </Button>
              )
            ) : (
              <div className="flex flex-col items-center text-center space-y-5 animate-in slide-in-from-bottom-4 duration-500 fade-in">
                <div className="relative">
                  {/* Radar Ripple Effect */}
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-[-10px] border border-indigo-400/20 rounded-full animate-pulse" style={{ animationDuration: '2s' }} />

                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-white text-indigo-900 rounded-full flex items-center justify-center relative shadow-xl border border-indigo-100 z-10">
                    <CreditCard className="w-10 h-10 drop-shadow-sm" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-black text-primary uppercase tracking-tight">Terminal Receiving</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Tap or Insert Card on POS Device</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-white p-5 border-t border-border/40 flex flex-col sm:flex-row gap-3 shrink-0">
          <Button variant="ghost" onClick={onClose} className="rounded-[1rem] font-black uppercase tracking-widest text-[9px] h-12 sm:w-auto hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
            Cancel
          </Button>
          <Button variant="outline" onClick={handleCreatePdf} className="rounded-[1rem] font-black uppercase tracking-widest text-[9px] h-12 border-primary/20 text-primary hover:bg-secondary sm:flex-1 transition-all hover:border-primary/40">
            PDF Bill
          </Button>
          <Button onClick={handlePaid} className="rounded-[1rem] font-black uppercase tracking-[0.2em] text-[9px] h-12 sm:flex-[1.5] bg-indigo-950 hover:bg-indigo-900 text-white shadow-[0_10px_20px_-10px_rgba(30,27,75,0.6)] transition-all hover:scale-[1.02] active:scale-95 group">
            Mark Settled <CheckCircle2 className="w-4 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CustomerDetails({ orders, reservations }) {
  const [searchTerm, setSearchTerm] = useState("");

  const customers = useMemo(() => {
    if (!orders) return [];
    const map = new Map();

    // Process Orders
    orders.forEach(o => {
      const key = o.phoneNumber;
      if (!map.has(key)) {
        map.set(key, {
          name: o.customerName,
          phone: o.phoneNumber,
          email: "N/A",
          lastTable: o.tableNumber || "Takeaway",
          visits: 1,
          totalSpent: Number(o.totalAmount),
          lastVisit: o.createdAt
        });
      } else {
        const existing = map.get(key);
        existing.visits += 1;
        existing.totalSpent += Number(o.totalAmount);
        if (new Date(o.createdAt) > new Date(existing.lastVisit)) {
          existing.lastVisit = o.createdAt;
          existing.lastTable = o.tableNumber || "Takeaway";
          existing.name = o.customerName; // Use latest name
        }
      }
    });

    // Merge Reservation Data for Email and additional visits
    reservations?.forEach(r => {
      const key = r.phoneNumber;
      if (map.has(key)) {
        const existing = map.get(key);
        if (r.email && existing.email === "N/A") existing.email = r.email;
        // Count reservations as "visits" too if not already captured by orders 
        // (Assuming some might reserve but not order through system, or just for more history)
        if (new Date(r.createdAt) > new Date(existing.lastVisit || 0)) {
          // Don't update lastTable from reservation as it's not a service point yet
        }
      } else {
        map.set(key, {
          name: r.customerName,
          phone: r.phoneNumber,
          email: r.email || "N/A",
          lastTable: "Reservation Only",
          visits: 1,
          totalSpent: 0,
          lastVisit: r.createdAt
        });
      }
    });

    return Array.from(map.values());
  }, [orders, reservations]);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight uppercase italic">Member Registry</h1>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60 italic">Guest Relationship Management</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input
            className="h-12 pl-12 rounded-2xl border-none bg-white shadow-sm font-bold text-xs"
            placeholder="Search Guest Database..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((c, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={c.phone}
            className="bg-white p-8 rounded-[2.5rem] border border-border/40 shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary border border-border/20">
                <User className="w-5 h-5" />
              </div>
              <Badge className="bg-primary/5 text-primary border-primary/10 text-[9px] font-black uppercase tracking-widest px-3 py-1 scale-90">
                {c.visits > 3 ? "Elite Member" : "Active Guest"}
              </Badge>
            </div>

            <div className="space-y-1 mb-8">
              <h4 className="font-black text-xl text-primary tracking-tight">{c.name}</h4>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{c.phone} • {c.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-dashed border-border/60">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-1">Total Visits</p>
                <p className="text-sm font-black text-primary">{c.visits} Episodes</p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-1">Lifetime Value</p>
                <p className="text-sm font-black text-accent italic tracking-tight">₹{c.totalSpent.toFixed(0)}</p>
              </div>
              <div className="col-span-2 pt-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40 mb-1">Latest Service Point</p>
                <p className="text-[10px] font-black text-primary uppercase flex items-center gap-2">
                  <Smartphone className="w-3 h-3 text-accent" /> {c.lastTable === "Takeaway" ? "Express" : `Table ${c.lastTable}`}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PaymentsView({ orders }) {
  const stats = useMemo(() => {
    if (!orders) return { total: 0, digital: 0, raw: 0 };
    const completed = orders.filter(o => o.status === "completed" || o.paymentStatus === "paid");
    return {
      total: completed.reduce((acc, o) => acc + Number(o.totalAmount), 0),
      count: completed.length,
      digital: completed.filter(o => o.paymentMethod !== "cash").reduce((acc, o) => acc + Number(o.totalAmount), 0),
      raw: completed.filter(o => o.paymentMethod === "cash").reduce((acc, o) => acc + Number(o.totalAmount), 0),
    };
  }, [orders]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-2xl font-black text-primary tracking-tight uppercase italic">Revenue Stream</h1>
        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60 italic">Financial Transaction Monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Aggregate Revenue" value={`₹${stats.total}`} color="bg-primary" icon={<IndianRupee className="w-4 h-4" />} />
        <StatCard label="Digital Settlement" value={`₹${stats.digital}`} color="bg-indigo-600" icon={<CreditCard className="w-4 h-4" />} />
        <StatCard label="Cash Management" value={`₹${stats.raw}`} color="bg-accent" icon={<IndianRupee className="w-4 h-4" />} />
      </div>

      <div className="bg-white rounded-[3rem] border border-border/40 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-dashed border-border/60 flex items-center justify-between bg-muted/20">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Transaction History Profile</h4>
          <Badge className="bg-white text-primary border-primary/10 text-[9px] font-black uppercase tracking-widest">Live Audit</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/10 border-b border-border/20">
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Trans ID</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Settlement Code</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Channel</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 text-right">Magnitude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {orders?.filter(o => o.status === "completed").map((o) => (
                <tr key={o.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-8 py-5 text-[10px] font-black text-muted-foreground opacity-40">#{o.id}</td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-primary tracking-tight">{o.customerName}</p>
                    <p className="text-[9px] text-muted-foreground font-bold opacity-40 uppercase tracking-widest">{format(new Date(o.createdAt), "HH:mm:ss")}</p>
                  </td>
                  <td className="px-8 py-5">
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-primary/10 text-primary/60">
                      {o.paymentMethod} Express
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-primary italic text-sm">₹{Number(o.totalAmount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-border/30 flex items-center gap-6 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6 z-10`}>
        {icon}
      </div>
      <div className="z-10">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 opacity-60 italic">{label}</p>
        <p className="text-xl font-black text-primary tracking-tighter transition-all group-hover:text-accent italic">{value}</p>
        {trend && <p className="text-[8px] font-black text-green-500 uppercase tracking-widest mt-1 opacity-80">{trend}</p>}
      </div>
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.02] rounded-full translate-x-8 -translate-y-8`} />
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    checkout_requested: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    pending: "bg-accent/10 text-accent border-accent/20",
    preparing: "bg-primary/10 text-primary border-primary/20",
    served: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  };

  const displayStatus = status === 'checkout_requested' ? 'Checkout' : status;

  return (
    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-dashed animate-in fade-in duration-700 ${styles[status]}`}>
      {displayStatus}
    </span>
  );
}

export default Dashboard;
