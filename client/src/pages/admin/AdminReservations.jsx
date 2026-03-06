import { useReservations, useUpdateReservationStatus } from "@/hooks/use-reservations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Users, Phone, Mail, Clock, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AdminReservations() {
    const { data: reservations, isLoading } = useReservations();
    const updateStatus = useUpdateReservationStatus();

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-accent rounded-full animate-spin" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/30 italic">Retrieving Guest Entries...</span>
        </div>
    );

    const sortedReservations = reservations?.sort(
        (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-primary tracking-tight uppercase italic">Guest Ledger</h1>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60 italic">Reservation Management Portal</p>
                </div>
                <Badge variant="outline" className="w-fit text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 bg-white border-primary/20 text-accent shadow-sm">
                    Total Entries: {reservations?.length || 0}
                </Badge>
            </div>

            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {sortedReservations?.map((res) => (
                        <motion.div
                            layout
                            key={res.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-border/40 shadow-[0_15px_60px_-15px_rgba(25,48,28,0.06)] flex flex-col xl:flex-row justify-between gap-10 hover:shadow-2xl transition-all duration-500 group"
                        >
                            <div className="flex-1 space-y-8">
                                <div className="flex flex-wrap items-center gap-4">
                                    <Badge className={`rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest ${res.status === "upcoming" ? "bg-accent text-white" :
                                        res.status === "completed" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                            "bg-red-500/10 text-red-600 border-red-500/20"
                                        }`}>
                                        {res.status}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-2 uppercase tracking-tight opacity-50">
                                        <Clock className="w-3.5 h-3.5" /> Ordered on {res.createdAt ? format(new Date(res.createdAt), "MMM d, h:mm a") : "Unknown"}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-xs border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                {res.customerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mb-0.5 opacity-60">Customer Name</p>
                                                <h4 className="font-black text-xl text-primary tracking-tight">{res.customerName}</h4>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pl-1">
                                            <p className="flex items-center gap-3 text-sm font-bold text-primary/70">
                                                <Phone className="w-4 h-4 text-accent" /> {res.phoneNumber}
                                            </p>
                                            {res.email && (
                                                <p className="flex items-center gap-3 text-sm font-bold text-primary/70 italic">
                                                    <Mail className="w-4 h-4 text-accent" /> {res.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-6 rounded-[2rem] border border-border/20">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 italic">Date</p>
                                            <p className="text-xs font-black text-primary tracking-tight flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-accent" /> {res.date ? format(new Date(res.date), "EEE, MMM do") : "N/A"}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 italic">Time</p>
                                            <p className="text-xs font-black text-primary tracking-tight flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-accent" /> {res.time}
                                            </p>
                                        </div>
                                        <div className="space-y-1 mt-2 col-span-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60 italic">Guest Count</p>
                                            <p className="text-xs font-black text-primary tracking-tight flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5 text-accent" /> {res.guestCount} Elite Guests
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {res.specialRequests && (
                                    <div className="p-6 bg-[#FDFCFB] rounded-2xl border border-dashed border-border/60 relative overflow-hidden">
                                        <div className="relative z-10 flex items-start gap-3">
                                            <Sparkles className="w-4 h-4 text-accent/40 mt-1 shrink-0" />
                                            <p className="text-sm italic font-medium text-muted-foreground leading-relaxed">
                                                "{res.specialRequests}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-row xl:flex-col gap-3 justify-center border-t xl:border-t-0 xl:border-l border-dashed border-border/80 pt-8 xl:pt-0 xl:pl-10 xl:w-56">
                                {res.status === "upcoming" && (
                                    <>
                                        <Button
                                            className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
                                            onClick={() => updateStatus.mutate({ id: res.id, status: "completed" })}
                                        >
                                            Process Arrival
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="flex-1 h-14 rounded-2xl text-destructive hover:bg-destructive/5 font-black text-[10px] uppercase tracking-widest"
                                            onClick={() => updateStatus.mutate({ id: res.id, status: "cancelled" })}
                                        >
                                            Revoke Entry
                                        </Button>
                                    </>
                                )}
                                {res.status === "completed" && (
                                    <div className="flex flex-col items-center gap-3 py-4 text-green-600 w-full">
                                        <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Fulfilled</p>
                                    </div>
                                )}
                                {res.status === "cancelled" && (
                                    <div className="flex flex-col items-center gap-3 py-4 text-red-600 w-full">
                                        <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                                            <XCircle className="w-8 h-8" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Revoked</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {reservations?.length === 0 && (
                    <div className="py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-border/40 flex flex-col items-center justify-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center text-primary/10">
                            <Calendar className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-primary/40 font-black uppercase tracking-[0.4em] text-sm italic">Ledger currently clear</p>
                            <p className="text-xs text-muted-foreground font-medium italic opacity-60">No pending reservations found in registry</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminReservations;
