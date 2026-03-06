
import { useMenu } from "@/hooks/use-menu";
import { useOffers } from "@/hooks/use-offers";
import { MenuCard } from "@/components/MenuCard";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Table2, Search, ShoppingBag } from "lucide-react";
import { useSearch } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

const CATEGORIES = ["All", "Starters", "Mains", "Beverages", "Desserts"];

function Menu() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [search, setSearch] = useState("");
    const { data: items, isLoading, error } = useMenu(selectedCategory === "All" ? null : selectedCategory);
    const { data: activeOffers } = useOffers(true);
    const searchString = useSearch();
    const searchParams = new URLSearchParams(searchString);
    const tableNumber = searchParams.get("table");
    const { total, items: cartItems, setIsOpen } = useCart();
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const filteredItems = items?.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">


            <div className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-24">
                {tableNumber && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 flex items-center justify-center"
                    >
                        <div className="bg-accent/10 border border-accent/20 px-8 py-3 rounded-2xl flex items-center gap-3 text-accent shadow-xl shadow-accent/5">
                            <Table2 className="w-5 h-5" />
                            <span className="font-black tracking-[0.1em] text-xs uppercase italic">Directing order to Table No: <span className="text-xl inline-block ml-2">{tableNumber}</span></span>
                        </div>
                    </motion.div>
                )}

                <div className="text-center mb-16 space-y-4">
                    <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-primary tracking-tight uppercase italic">La Carte</h1>
                    <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base md:text-xl font-medium opacity-80 leading-relaxed px-4">
                        Discover our carefully curated selection of artisanal dishes, <br className="hidden md:block" />
                        prepared with heritage ingredients and modern passion.
                    </p>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-16 px-4">
                    <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 pb-2 md:pb-0 w-full md:w-auto">
                        {CATEGORIES.map((cat) => (
                            <Button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`rounded-full px-6 h-11 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                                    : "bg-white border-border/40 text-muted-foreground hover:text-primary hover:bg-secondary/50"
                                    }`}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            className="pl-12 h-12 rounded-2xl bg-white border-border/40 font-medium text-sm shadow-sm focus-visible:ring-accent"
                            placeholder="Find your favorite..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Menu Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-12 h-12 border-4 border-primary/10 border-t-accent rounded-full animate-spin" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/30 italic">Curating Menu...</span>
                    </div>
                ) : error ? (
                    <div className="text-center text-destructive py-32 font-bold px-6">
                        Failed to fetch artisanal items. Please refresh the experience.
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 px-4 reveal-grid"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredItems?.map((item) => (
                                <MenuCard key={item.id} item={item} activeOffers={activeOffers} />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {!isLoading && filteredItems?.length === 0 && (
                    <div className="text-center py-32 space-y-4 px-6 scale-up">
                        <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-8 h-8 text-primary/10" />
                        </div>
                        <h3 className="text-xl font-bold text-primary">No items found</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto">Try adjusting your category or search to find what you're craving.</p>
                    </div>
                )}
            </div>

            {/* Floating Cart Button */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-8 left-0 right-0 z-40 flex justify-center pointer-events-none px-4"
                    >
                        <Button
                            onClick={() => setIsOpen(true)}
                            className="pointer-events-auto w-full max-w-sm h-[68px] rounded-full bg-primary text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all text-sm flex items-center justify-between px-6 border-2 border-primary/80"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col items-start leading-tight">
                                    <span className="text-[11px] tracking-[0.2em] mb-0.5">View Selection</span>
                                    <span className="text-[10px] text-white/90 normal-case font-medium tracking-normal">{cartCount} {cartCount === 1 ? 'item' : 'items'} added</span>
                                </div>
                            </div>
                            <span className="text-xl font-display italic tracking-tighter">₹{total.toFixed(2)}</span>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Menu;
