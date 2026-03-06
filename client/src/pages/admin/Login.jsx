import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Lock, User, Sparkles, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});

function Login() {
  const { login, user, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/admin/dashboard");
    }
  }, [user, setLocation]);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" }
  });

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (e) {
      // Error handled by Auth provider/toast
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] selection:bg-accent/20 px-6">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-[1.5rem] text-white shadow-2xl mb-8 group overflow-hidden cursor-pointer hover:scale-110 transition-transform">
              <span className="font-display font-black text-3xl transition-transform group-hover:rotate-12 group-hover:scale-125">P</span>
            </div>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-black text-[10px] uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Secure Portal
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tighter uppercase italic">
            Manager Login
          </h1>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2 opacity-60">
            Access the Parsik Administration Suite
          </p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(25,48,28,0.12)] border border-border/40">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                        <Input className="h-14 rounded-2xl bg-secondary/30 border-none pl-12 pr-6 focus-visible:ring-accent font-bold text-sm" placeholder="Identification code" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Token</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                        <Input type="password" className="h-14 rounded-2xl bg-secondary/30 border-none pl-12 pr-6 focus-visible:ring-accent font-bold text-sm" placeholder="••••••••" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-[10px] group"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Authenticating Authority..." : (
                  <span className="flex items-center gap-2">
                    Enter Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 hover:text-accent cursor-pointer transition-colors">
              ← Return to Public Experience
            </span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
