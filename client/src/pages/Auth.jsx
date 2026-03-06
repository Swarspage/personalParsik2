import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, Sparkles, ArrowRight, Mail, Phone, ShoppingBag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

const registerSchema = z.object({
    username: z.string().min(3, "Min 3 characters"),
    password: z.string().min(6, "Min 6 characters"),
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email"),
    phoneNumber: z.string().min(10, "Invalid phone number")
});

function AuthPage() {
    const { login, register, user, isLoggingIn, isRegistering } = useAuth();
    const [, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState("login");

    useEffect(() => {
        if (user) {
            if (user.role === "admin") {
                setLocation("/admin/dashboard");
            } else {
                setLocation("/menu");
            }
        }
    }, [user, setLocation]);

    const loginForm = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: "", password: "" }
    });

    const registerForm = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: "",
            password: "",
            fullName: "",
            email: "",
            phoneNumber: ""
        }
    });

    const onLoginSubmit = async (data) => {
        try {
            await login(data);
        } catch (e) { }
    };

    const onRegisterSubmit = async (data) => {
        try {
            await register(data);
        } catch (e) { }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB] px-6 py-12 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[480px] relative z-10"
            >
                <div className="text-center mb-8">
                    <Link href="/">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl text-white shadow-xl mb-6 cursor-pointer hover:scale-110 transition-transform">
                            <span className="font-bold text-lg">P</span>
                        </div>
                    </Link>
                    <h1 className="text-3xl font-display text-primary tracking-tight mb-2">Parsik <span className="text-accent italic">elite</span></h1>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                        Guest Authentication Protocol
                    </p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(25,48,28,0.12)] border border-border/40">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-2 p-1 bg-secondary/30 rounded-2xl mb-8 h-12">
                            <TabsTrigger value="login" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
                            <TabsTrigger value="register" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Join Club</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                                    <FormField
                                        control={loginForm.control}
                                        name="username"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Username / ID</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                                                        <Input className="h-14 rounded-2xl bg-secondary/30 border-none pl-12 focus-visible:ring-accent font-bold text-sm" placeholder="Enter username" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Token</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
                                                        <Input type="password" className="h-14 rounded-2xl bg-secondary/30 border-none pl-12 focus-visible:ring-accent font-bold text-sm" placeholder="••••••••" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full h-15 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all text-xs"
                                        disabled={isLoggingIn}
                                    >
                                        {isLoggingIn ? "Authenticating..." : "Authorize Access"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="register">
                            <Form {...registerForm}>
                                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={registerForm.control}
                                            name="username"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Username</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-12 rounded-xl bg-secondary/30 border-none px-4 focus-visible:ring-accent font-bold text-xs" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={registerForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" className="h-12 rounded-xl bg-secondary/30 border-none px-4 focus-visible:ring-accent font-bold text-xs" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <FormField
                                        control={registerForm.control}
                                        name="fullName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</FormLabel>
                                                <FormControl>
                                                    <Input className="h-12 rounded-xl bg-secondary/30 border-none px-4 focus-visible:ring-accent font-bold text-xs" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Direct Email</FormLabel>
                                                <FormControl>
                                                    <Input className="h-12 rounded-xl bg-secondary/30 border-none px-4 focus-visible:ring-accent font-bold text-xs" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={registerForm.control}
                                        name="phoneNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Connect No.</FormLabel>
                                                <FormControl>
                                                    <Input className="h-12 rounded-xl bg-secondary/30 border-none px-4 focus-visible:ring-accent font-bold text-xs" placeholder="+91" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full h-15 mt-2 rounded-2xl bg-accent text-white font-bold uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-[1.01] active:scale-95 transition-all text-xs"
                                        disabled={isRegistering}
                                    >
                                        {isRegistering ? "Creating Profile..." : "Initialize Membership"}
                                    </Button>
                                </form>
                            </Form>
                        </TabsContent>
                    </Tabs>
                </div>

                <p className="mt-8 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-40">
                    Strict Security Protocols in Effect
                </p>
            </motion.div>
        </div>
    );
}

export default AuthPage;
