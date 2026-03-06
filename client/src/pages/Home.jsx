import { motion } from "framer-motion";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Clock, MapPin, Coffee, Zap } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-background overflow-x-hidden">


            {/* Hero Section */}
            <section className="relative pt-6 md:pt-12 pb-16 md:pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="z-10 text-center lg:text-left space-y-6 md:space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-bold text-[10px] sm:text-xs tracking-[0.2em] uppercase mx-auto lg:mx-0">
                            <Star className="w-3 h-3 fill-accent" />
                            Est. 2015 • Mumbai
                        </div>

                        <h1 className="heading-hero text-primary font-normal leading-tight">
                            The Art of <br className="hidden sm:block" />
                            <span className="text-accent italic font-normal">Perfectly Brewed</span> <br />
                            Moments
                        </h1>

                        <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                            Experience the finest blend of artisanal coffee and gourmet cuisine in a space designed for connection.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <Link href="/menu">
                                <Button size="lg" className="h-14 md:h-16 px-8 md:px-10 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group w-full sm:w-auto text-base font-bold">
                                    View Menu Card <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="/scan">
                                <Button variant="outline" size="lg" className="h-14 md:h-16 px-8 md:px-10 rounded-2xl border-2 border-primary/10 text-primary hover:bg-primary/5 w-full sm:w-auto text-base font-bold flex items-center justify-center gap-2">
                                    <Zap className="w-5 h-5 text-accent" />
                                    Quick Scan & Order
                                </Button>
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-8 md:gap-12 pt-8 border-t border-border/50">
                            <StatItem label="Rating" value="4.9/5" />
                            <StatItem label="Cuisine" value="Global" />
                            <StatItem label="Outlets" value="2" />
                        </div>
                    </motion.div>

                    {/* Hero Visuals */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative hidden sm:block lg:h-[600px]"
                    >
                        <div className="relative h-full w-full">
                            <div className="absolute top-0 right-0 w-[80%] h-[80%] rounded-[3rem] overflow-hidden rotate-3 shadow-2xl border-8 border-white z-20 transition-transform hover:rotate-0 duration-700">
                                <img
                                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&q=80"
                                    alt="Cafe atmosphere"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-[2.5rem] overflow-hidden -rotate-6 shadow-2xl border-8 border-white z-10 transition-transform hover:rotate-0 duration-700">
                                <img
                                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=80"
                                    alt="Espresso Art"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="bg-secondary/30 py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="heading-section text-primary">Why Parsik Cafe?</h2>
                        <p className="text-muted-foreground text-sm uppercase tracking-[0.3em] font-black">Crafting Excellence Since 2015</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 reveal-grid">
                        <FeatureCard
                            icon={<Coffee className="w-6 h-6" />}
                            title="Artisanal Roasts"
                            desc="We source ethical beans directly from estates and roast them to highlight their unique origin notes."
                        />
                        <FeatureCard
                            icon={<Clock className="w-6 h-6" />}
                            title="Freshly Prepared"
                            desc="Every dish is made-to-order using high-quality locally sourced seasonal ingredients."
                        />
                        <FeatureCard
                            icon={<MapPin className="w-6 h-6" />}
                            title="Modern Space"
                            desc="Our cafes are designed to be an extension of your living room. Comfortable and inspiring."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

function StatItem({ value, label }) {
    return (
        <div className="text-center lg:text-left">
            <div className="text-2xl font-display text-primary italic">{value}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">{label}</div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-border/20 group hover:shadow-xl transition-all duration-500">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mb-6 shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:bg-accent transition-all duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-primary">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
