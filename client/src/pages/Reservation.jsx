
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReservationSchema } from "@shared/schema";
import { useCreateReservation } from "@/hooks/use-reservations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, Sparkles, Heart } from "lucide-react";

function Reservation() {
    const createReservation = useCreateReservation();
    const form = useForm({
        resolver: zodResolver(insertReservationSchema),
        defaultValues: {
            customerName: "",
            phoneNumber: "",
            email: "",
            branch: "airoli",
            date: "",
            time: "",
            guestCount: 2,
            specialRequests: ""
        }
    });

    const onSubmit = (data) => {
        createReservation.mutate(data, {
            onSuccess: () => form.reset()
        });
    };

    return (
        <div className="min-h-screen bg-background">


            <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
                <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-start">

                    {/* Left Content - Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-12"
                    >
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-black text-[10px] uppercase tracking-widest">
                                <Sparkles className="w-3.5 h-3.5" />
                                Privileged Dining
                            </div>
                            <h1 className="heading-hero text-primary font-normal leading-tight">
                                Secure Your <br />
                                <span className="text-accent italic font-normal">Signature Table</span>
                            </h1>
                            <p className="text-muted-foreground text-sm sm:text-base md:text-xl font-medium leading-relaxed max-w-lg">
                                Whether it's an intimate date night or a grand family reunion, let us prepare the perfect setting for your next culinary journey.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InfoCard
                                icon={<Calendar className="w-5 h-5" />}
                                title="Timely Bookings"
                                desc="Reserve up to 30 days in advance for special events."
                            />
                            <InfoCard
                                icon={<Users className="w-5 h-5" />}
                                title="Group Dining"
                                desc="Customized seating arrangements for up to 12 guests."
                            />
                        </div>

                        <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                            <div className="relative z-10 space-y-4">
                                <h3 className="font-display text-2xl font-bold">The Golden Hours</h3>
                                <div className="space-y-3 opacity-80 text-sm font-medium tracking-tight">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                                        <span>WEEKDAYS</span>
                                        <span className="font-black">11:00 AM — 11:00 PM</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>WEEKENDS</span>
                                        <span className="font-black">10:00 AM — 12:00 AM</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-10 rounded-full translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        <div className="rounded-[3rem] overflow-hidden aspect-[16/9] shadow-2xl border-4 border-white grayscale hover:grayscale-0 transition-all duration-1000">
                            <img
                                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&auto=format&fit=crop&q=80"
                                alt="Atmosphere"
                                className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform [transition-duration:3s]"
                            />
                        </div>
                    </motion.div>

                    {/* Form Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="lg:sticky lg:top-32"
                    >
                        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(25,48,28,0.12)] border border-border/40 text-center">
                            <div className="mb-10 space-y-2">
                                <h3 className="text-3xl font-display text-primary">Table Request</h3>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground opacity-50">Artisanal Dining • Verified Entry</p>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <div className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="customerName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Guest Name</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-14 rounded-2xl bg-secondary/30 border-none px-6 focus-visible:ring-accent" placeholder="Full name of host" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="phoneNumber"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input className="h-14 rounded-2xl bg-secondary/30 border-none px-6 focus-visible:ring-accent" placeholder="+91 0000 0000" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email <span className="opacity-40 italic">(Optional)</span></FormLabel>
                                                        <FormControl>
                                                            <Input className="h-14 rounded-2xl bg-secondary/30 border-none px-6 focus-visible:ring-accent" placeholder="host@example.com" {...field} value={field.value || ""} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="date"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Date of Visit</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" className="h-14 rounded-2xl bg-secondary/30 border-none px-6 focus-visible:ring-accent block" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="time"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Preferred Time</FormLabel>
                                                        <FormControl>
                                                            <Input type="time" className="h-14 rounded-2xl bg-secondary/30 border-none px-6 focus-visible:ring-accent block" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="branch"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Location</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-14 rounded-2xl bg-secondary/30 border-none px-6 focus-visible:ring-accent">
                                                                    <SelectValue placeholder="Select Branch" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-2xl">
                                                                <SelectItem value="airoli">Airoli Outlet</SelectItem>
                                                                <SelectItem value="thane">Thane Outlet</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="guestCount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Guests</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                max="20"
                                                                className="h-14 rounded-2xl bg-secondary/30 border-none px-6 focus-visible:ring-accent"
                                                                {...field}
                                                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : "")}
                                                                value={field.value || ""}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="specialRequests"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Preferences & Notes</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            className="rounded-2xl bg-secondary/30 border-none px-6 py-4 min-h-[120px] focus-visible:ring-accent"
                                                            placeholder="Anniversaries, dietary allergies, or high chair requirements..."
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-16 rounded-[1.5rem] bg-accent text-white font-bold uppercase tracking-widest shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all text-[11px]"
                                        disabled={createReservation.isPending}
                                    >
                                        {createReservation.isPending ? "Confirming Selection..." : "Confirm Invitation"}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ icon, title, desc }) {
    return (
        <div className="bg-white p-6 rounded-[2rem] border border-border/40 shadow-sm flex flex-col gap-3 group hover:shadow-xl transition-all duration-500">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-primary group-hover:text-accent transition-colors">{title}</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1 opacity-70">{desc}</p>
            </div>
        </div>
    );
}

export default Reservation;
