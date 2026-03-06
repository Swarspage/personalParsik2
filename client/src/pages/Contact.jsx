
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, MessageSquare, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function Contact() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to send message");
    },
    onSuccess: () => {
      toast({ title: "Inquiry Received", description: "Our concierge will reach out shortly." });
      form.reset();
    },
    onError: () => {
      toast({ variant: "destructive", title: "Transmission Error", description: "Failed to send message." });
    }
  });

  return (
    <div className="min-h-screen bg-background">


      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-black text-[10px] uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Concierge Services
          </div>
          <h1 className="heading-hero text-primary font-normal leading-tight">
            Direct <span className="text-accent italic">Correspondence</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-xl font-medium max-w-2xl mx-auto opacity-70 leading-relaxed mt-4">
            Have specific inquiries about our artisanal curriculum or private events? <br className="hidden md:block" />
            Our dedicated team is ready to assist.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-16 md:gap-24 items-start">
          {/* Contact Info Chips */}
          <div className="lg:col-span-2 space-y-6">
            <ContactInfoItem
              icon={<MapPin className="w-5 h-5" />}
              title="Proprietary Outlet"
              content="Sector 20, Airoli Knowledge Park, Mumbai"
            />
            <ContactInfoItem
              icon={<Phone className="w-5 h-5" />}
              title="Direct Line"
              content="+91 98765 43210"
            />
            <ContactInfoItem
              icon={<Mail className="w-5 h-5" />}
              title="Registry Email"
              content="hello@parsikcafe.com"
            />

            <div className="p-8 bg-primary rounded-[2.5rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group mt-12">
              <div className="relative z-10 space-y-4">
                <h3 className="font-display text-xl font-bold italic tracking-tight">Rapid Response Protocol</h3>
                <p className="text-xs text-white/60 font-medium leading-relaxed">
                  Inquiries are typically evaluated and addressed within 120 minutes during operational cycles.
                </p>
              </div>
              <MessageSquare className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-10 rotate-12" />
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white p-8 md:p-12 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(25,48,28,0.12)] border border-border/40 relative">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Your Identity</FormLabel>
                        <FormControl>
                          <Input className="h-14 rounded-2xl bg-secondary/30 border-none px-6 focus-visible:ring-accent font-bold text-sm" placeholder="Full name" {...field} />
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
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Connect Email</FormLabel>
                        <FormControl>
                          <Input className="h-14 rounded-2xl bg-secondary/30 border-none px-6 focus-visible:ring-accent font-bold text-sm" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nature of Inquiry</FormLabel>
                      <FormControl>
                        <Input className="h-14 rounded-2xl bg-secondary/30 border-none px-6 focus-visible:ring-accent font-bold text-sm" placeholder="e.g. Corporate Booking" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Detail Specification</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Elaborate on your requirements..."
                          className="min-h-[160px] rounded-2xl bg-secondary/30 border-none px-6 py-4 focus-visible:ring-accent font-medium text-sm leading-relaxed"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-16 rounded-[1.5rem] bg-accent text-white font-bold uppercase tracking-widest shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all text-xs group"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Transmitting..." : (
                    <span className="flex items-center gap-3">
                      Dispatch Message <Send className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactInfoItem({ icon, title, content }) {
  return (
    <div className="flex items-center gap-6 p-8 bg-white rounded-[2.5rem] border border-border/40 shadow-sm hover:shadow-xl transition-all duration-500 group">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-500 shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mb-1">{title}</h3>
        <p className="font-semibold text-primary tracking-tight leading-tight">{content}</p>
      </div>
    </div>
  );
}

export default Contact;
