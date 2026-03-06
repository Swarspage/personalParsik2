import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, Calendar, Shield, LogOut, ArrowLeft, Receipt, CreditCard, Download, Clock, ChefHat, Utensils, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyOrders } from "@/hooks/use-orders";
import { generateBillPDF } from "@/lib/bill-pdf";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
    const { user, isLoading, logout } = useAuth();
    const { data: myOrders, isLoading: ordersLoading } = useMyOrders();

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Redirect to="/auth" />;
    }

    // Filter to only show completed orders/payments for the user facing side
    const activeOrders = myOrders?.filter(o => o.status !== "completed") || [];
    const completedOrders = myOrders?.filter(o => o.status === "completed" && o.paymentStatus === "paid") || [];

    // Sort active by status (pending first) then by newest first
    const statusWeight = { pending: 1, preparing: 2, served: 3, completed: 4 };
    const sortedActiveOrders = [...activeOrders].sort((a, b) => {
        if (statusWeight[a.status] !== statusWeight[b.status]) {
            return statusWeight[a.status] - statusWeight[b.status];
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    // Sort completed by newest first
    const sortedOrders = [...completedOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), "MMM do, yyyy h:mm a");
        } catch (e) {
            return "Recently";
        }
    };

    const handleDownloadBill = (order) => {
        // Pass the single order in an array so it doesn't consolidate other things
        generateBillPDF(order, [order]);
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-6">
                    <Link href="/">
                        <Button variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>

                <div className="mb-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display text-primary mb-2">My Profile</h1>
                        <p className="text-muted-foreground">Manage your Parsik Cafe account and view your dining history</p>
                    </div>
                    <Button
                        variant="outline"
                        className="border-destructive/20 text-destructive hover:bg-destructive/10 rounded-xl"
                        onClick={() => logout()}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Sidebar Profile Card */}
                    <Card className="md:col-span-1 border-none shadow-2xl shadow-primary/5 bg-white/80 backdrop-blur-md overflow-hidden p-8 flex flex-col items-center text-center rounded-[2rem] h-fit">
                        <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                            <span className="text-4xl font-display text-primary font-bold">
                                {getInitials(user.fullName || user.username)}
                            </span>
                            <div className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border border-border/50">
                                <Shield className={`w-4 h-4 ${user._type === 'admin' ? 'text-accent' : 'text-primary'}`} />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-primary mb-1">{user.fullName || "User"}</h2>
                        <p className="text-muted-foreground font-medium mb-6 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" />
                            {user.email || "No email"}
                        </p>

                        <div className="w-full h-px bg-border/50 mb-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                        </div>

                        <div className="w-full space-y-4 text-left">
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">{user.phoneNumber || "No phone"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">Joined {user.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Recently"}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/50 w-full">
                            <div className="inline-flex items-center px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-widest">
                                {user._type === 'admin' ? 'Administrator' : 'Verified Customer'}
                            </div>
                        </div>
                    </Card>

                    {/* Right Content Area with Tabs */}
                    <div className="md:col-span-2">
                        <Tabs defaultValue="live" className="w-full">
                            <TabsList className="max-w-full overflow-x-auto bg-white/50 backdrop-blur-md border border-border/50 p-2 mb-8 h-auto flex justify-start rounded-2xl shadow-sm gap-2">
                                <TabsTrigger
                                    value="live"
                                    className="rounded-xl px-6 py-3 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap relative"
                                >
                                    <ChefHat className="w-4 h-4 mr-2" /> Live Orders
                                    {sortedActiveOrders.length > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white rounded-full text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                                            {sortedActiveOrders.length}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="orders"
                                    className="rounded-xl px-6 py-3 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
                                >
                                    <Receipt className="w-4 h-4 mr-2" /> Order History
                                </TabsTrigger>
                                <TabsTrigger
                                    value="payments"
                                    className="rounded-xl px-6 py-3 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all whitespace-nowrap"
                                >
                                    <CreditCard className="w-4 h-4 mr-2" /> Payments
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent key="live" value="live" className="space-y-6 m-0" asChild>
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-display text-primary flex items-center gap-3">
                                            Active Orders
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent border border-white"></span>
                                            </span>
                                        </h3>
                                    </div>

                                    {ordersLoading ? (
                                        <div className="p-12 text-center text-muted-foreground">Syncing live kitchen updates...</div>
                                    ) : sortedActiveOrders.length === 0 ? (
                                        <div className="bg-white/50 border border-dashed border-border/60 rounded-[2rem] p-12 text-center flex flex-col items-center">
                                            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                                                <ChefHat className="w-8 h-8 text-primary/40" />
                                            </div>
                                            <h4 className="text-lg font-bold text-primary mb-2">No active orders right now</h4>
                                            <p className="text-muted-foreground mb-6 max-w-sm">Place an order from the menu and watch its progress live here.</p>
                                            <Link href="/menu">
                                                <Button className="rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-xs h-12 px-8 shadow-xl shadow-primary/20">
                                                    Browse Menu
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {sortedActiveOrders.map((order) => (
                                                <Card key={order.id} className="border-accent/20 shadow-lg shadow-accent/5 overflow-hidden rounded-[1.5rem] bg-white relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
                                                    <div className="p-6">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge className="bg-accent/10 text-accent hover:bg-accent/10 border-none font-black text-[10px] tracking-widest uppercase">
                                                                        Order #{order.id}
                                                                    </Badge>
                                                                    <span className="text-muted-foreground text-sm flex items-center">
                                                                        <Clock className="w-3.5 h-3.5 mr-1" />
                                                                        {formatDate(order.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <p className="font-semibold text-primary">
                                                                    {order.branch === 'airoli' ? 'Airoli Branch' : 'Thane Branch'} • {order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Total</p>
                                                                <p className="text-xl font-black text-primary">₹{Number(order.totalAmount).toFixed(2)}</p>
                                                            </div>
                                                        </div>

                                                        {/* Status Timeline UI */}
                                                        <div className="relative mt-4">
                                                            {/* Track Line */}
                                                            <div className="absolute top-1/2 left-0 w-full h-1 bg-muted/50 -translate-y-1/2 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    className="h-full bg-accent"
                                                                    initial={{ width: "0%" }}
                                                                    animate={{
                                                                        width: order.status === "pending" ? "15%" :
                                                                            order.status === "preparing" ? "50%" :
                                                                                order.status === "served" ? "100%" : "0%"
                                                                    }}
                                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                                />
                                                            </div>

                                                            {/* Flex Container for defined steps */}
                                                            <div className="relative flex justify-between items-center z-10">

                                                                {/* Stage 1: Received */}
                                                                <div className="flex flex-col items-center gap-2 bg-white px-2">
                                                                    <div className="relative">
                                                                        {order.status === "pending" && (
                                                                            <span className="absolute -inset-1 rounded-full bg-accent opacity-30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                                                                        )}
                                                                        <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500
                                                                                ${order.status === "pending" || order.status === "preparing" || order.status === "served"
                                                                                ? "border-accent bg-accent text-white shadow-lg shadow-accent/30"
                                                                                : "border-muted bg-white text-muted-foreground"}`}
                                                                        >
                                                                            <Receipt className="w-4 h-4" />
                                                                        </div>
                                                                    </div>
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap mt-1 
                                                                            ${order.status === "pending" || order.status === "preparing" || order.status === "served" ? "text-primary" : "text-muted-foreground"}`}
                                                                    >
                                                                        Received
                                                                    </span>
                                                                </div>

                                                                {/* Stage 2: Kitchen */}
                                                                <div className="flex flex-col items-center gap-2 bg-white px-2">
                                                                    <div className="relative">
                                                                        {order.status === "preparing" && (
                                                                            <span className="absolute -inset-1 rounded-full bg-accent opacity-30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                                                                        )}
                                                                        <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500
                                                                                ${order.status === "preparing" || order.status === "served"
                                                                                ? "border-accent bg-accent text-white shadow-lg shadow-accent/30"
                                                                                : "border-muted bg-white text-muted-foreground"}`}
                                                                        >
                                                                            <ChefHat className="w-4 h-4" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col items-center absolute -bottom-8">
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap
                                                                                ${order.status === "preparing" || order.status === "served" ? "text-primary" : "text-muted-foreground"}`}
                                                                        >
                                                                            Preparing
                                                                        </span>
                                                                        {order.status === "preparing" && (
                                                                            <span className="text-[8px] font-bold text-accent italic opacity-80 mt-0.5">Chef is cooking!</span>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Stage 3: Served */}
                                                                <div className="flex flex-col items-center gap-2 bg-white px-2">
                                                                    <div className="relative">
                                                                        {order.status === "served" && (
                                                                            <span className="absolute -inset-1 rounded-full bg-accent opacity-30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                                                                        )}
                                                                        <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500
                                                                                ${order.status === "served"
                                                                                ? "border-accent bg-accent text-white shadow-lg shadow-accent/30"
                                                                                : "border-muted bg-white text-muted-foreground"}`}
                                                                        >
                                                                            <Utensils className="w-4 h-4" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col items-center mt-1">
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap 
                                                                                ${order.status === "served" ? "text-primary" : "text-muted-foreground"}`}
                                                                        >
                                                                            Served
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Order Items summary */}
                                                        <div className="mt-12 bg-muted/20 rounded-xl p-4 border border-border/40">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3 border-b border-border/40 pb-2">Order Items ({order.items?.length || 0})</p>
                                                            <div className="space-y-2">
                                                                {order.items?.map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                                        <span className="font-medium text-primary"><span className="text-muted-foreground mr-2">{item.quantity}x</span> {item.dishName || item.menuItem?.name || "Item"}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {order.specialRequests && (
                                                                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/50 flex gap-2 items-start opacity-90">
                                                                    <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                                                    <div>
                                                                        <span className="block text-[9px] font-black uppercase tracking-widest text-amber-800 mb-0.5">Cooking Instructions</span>
                                                                        <p className="text-[11px] font-medium text-amber-900/80 leading-relaxed italic">"{order.specialRequests}"</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </TabsContent>

                            <TabsContent key="orders" value="orders" className="space-y-6 m-0" asChild>
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-display text-primary flex items-center">
                                            Past Orders
                                        </h3>
                                        <Badge variant="outline" className="text-xs uppercase tracking-widest font-bold">
                                            {sortedOrders.length} Total
                                        </Badge>
                                    </div>

                                    {ordersLoading ? (
                                        <div className="p-12 text-center text-muted-foreground">Loading your orders...</div>
                                    ) : sortedOrders.length === 0 ? (
                                        <div className="bg-white/50 border border-dashed border-border/60 rounded-[2rem] p-12 text-center flex flex-col items-center">
                                            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                                                <ChefHat className="w-8 h-8 text-primary/40" />
                                            </div>
                                            <h4 className="text-lg font-bold text-primary mb-2">No completed orders yet</h4>
                                            <p className="text-muted-foreground mb-6 max-w-sm">When you dine with us, your completed orders will appear here along with downloadable bills.</p>
                                            <Link href="/menu">
                                                <Button className="rounded-xl bg-primary text-white font-bold uppercase tracking-widest text-xs h-12 px-8 shadow-xl shadow-primary/20">
                                                    Browse Menu
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {sortedOrders.map((order) => (
                                                <Card key={order.id} className="border-border/40 shadow-sm hover:shadow-md transition-shadow overflow-hidden rounded-[1.5rem] bg-white group">
                                                    <div className="p-6">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-black text-[10px] tracking-widest uppercase">
                                                                        Order #{order.id}
                                                                    </Badge>
                                                                    <span className="text-muted-foreground text-sm flex items-center">
                                                                        <Clock className="w-3.5 h-3.5 mr-1" />
                                                                        {formatDate(order.createdAt)}
                                                                    </span>
                                                                </div>
                                                                <p className="font-semibold text-primary">
                                                                    {order.branch === 'airoli' ? 'Airoli Branch' : 'Thane Branch'} • {order.tableNumber ? `Table ${order.tableNumber}` : 'Takeaway'}
                                                                </p>
                                                            </div>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-xl border-primary/20 hover:bg-primary/5 text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => handleDownloadBill(order)}
                                                            >
                                                                <Download className="w-4 h-4 mr-2" /> Download Bill
                                                            </Button>
                                                        </div>

                                                        <div className="bg-secondary/30 rounded-xl p-4 mb-4">
                                                            <ul className="space-y-2">
                                                                {order.items.slice(0, 3).map((item, idx) => (
                                                                    <li key={idx} className="flex justify-between text-sm">
                                                                        <span className="font-medium text-foreground">
                                                                            <span className="text-muted-foreground mr-2">{item.quantity}x</span>
                                                                            {item.dishName}
                                                                        </span>
                                                                        <span className="text-muted-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                                    </li>
                                                                ))}
                                                                {order.items.length > 3 && (
                                                                    <li className="text-xs text-muted-foreground italic pt-1">
                                                                        + {order.items.length - 3} more items
                                                                    </li>
                                                                )}
                                                            </ul>
                                                            {order.specialRequests && (
                                                                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/50 flex gap-2 items-start opacity-90">
                                                                    <MessageSquare className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                                                    <div>
                                                                        <span className="block text-[9px] font-black uppercase tracking-widest text-amber-800 mb-0.5">Cooking Instructions</span>
                                                                        <p className="text-[11px] font-medium text-amber-900/80 leading-relaxed italic">"{order.specialRequests}"</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-between items-center pt-2 border-t border-border/40">
                                                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Total Paid</span>
                                                            <span className="text-xl font-display text-accent font-bold">₹{Number(order.totalAmount).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </TabsContent>

                            <TabsContent key="payments" value="payments" className="space-y-6 m-0" asChild>
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-display text-primary flex items-center">
                                            Payment Records
                                        </h3>
                                    </div>

                                    {ordersLoading ? (
                                        <div className="p-12 text-center text-muted-foreground">Loading records...</div>
                                    ) : sortedOrders.length === 0 ? (
                                        <div className="bg-white/50 border border-dashed border-border/60 rounded-[2rem] p-12 text-center">
                                            <p className="text-muted-foreground">No payment records found.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-[1.5rem] border border-border/40 overflow-hidden shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead>
                                                        <tr className="border-b border-border/40 bg-muted/20">
                                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Order Ref</th>
                                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Method</th>
                                                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/40 font-sans">
                                                        {sortedOrders.map((order) => (
                                                            <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                                                    {formatDate(order.createdAt)}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                                                    #{order.id}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline" className="bg-white text-[10px] font-bold uppercase tracking-widest">
                                                                            {order.paymentMethod}
                                                                        </Badge>
                                                                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/10 border-none text-[10px] font-black uppercase tracking-widest">
                                                                            Paid
                                                                        </Badge>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right font-display text-accent font-bold">
                                                                    ₹{Number(order.totalAmount).toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
