import { useState } from "react";
import { useMenu, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem } from "@/hooks/use-menu";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Utensils, Edit2, Search, Filter, IndianRupee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMenuItemSchema } from "@shared/schema";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { BulkMenuForm } from "@/components/BulkMenuForm";

const DEFAULT_CATEGORIES = ["Beverages", "Starters", "Mains", "Desserts", "Burgers & Wraps"];

function getMergedCategories(menuItems) {
    if (!menuItems) return DEFAULT_CATEGORIES;
    const itemCategories = menuItems.map(i => i.category);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...itemCategories])).filter(Boolean).sort();
}

function MenuItemForm({ item, onSuccess, categories }) {
    const createItem = useCreateMenuItem();
    const updateItem = useUpdateMenuItem();
    const isEditing = !!item;

    const form = useForm({
        resolver: zodResolver(insertMenuItemSchema),
        defaultValues: item ? {
            ...item,
            price: String(item.price)
        } : {
            name: "",
            description: "",
            price: "",
            category: "Beverages",
            imageUrl: "",
            isVeg: true,
            isAvailable: true,
            branch: "all"
        }
    });

    const onSubmit = (data) => {
        if (isEditing) {
            updateItem.mutate({ id: item.id, data }, {
                onSuccess: () => {
                    onSuccess();
                }
            });
        } else {
            createItem.mutate(data, {
                onSuccess: () => {
                    onSuccess();
                    form.reset();
                }
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Item Name</FormLabel>
                            <FormControl><Input className="h-12 rounded-xl" placeholder="e.g. Mocha Blast" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</FormLabel>
                            <FormControl><Textarea className="rounded-xl min-h-[100px]" placeholder="Describe the dish..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price (₹)</FormLabel>
                                <FormControl><Input className="h-12 rounded-xl" type="number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 rounded-xl">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {(categories || DEFAULT_CATEGORIES).map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Image URL</FormLabel>
                            <FormControl><Input className="h-12 rounded-xl" placeholder="https://..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-8 p-4 bg-muted/20 rounded-2xl border border-dashed">
                    <FormField
                        control={form.control}
                        name="isVeg"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="text-xs font-bold text-primary">Vegetarian</FormLabel>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="isAvailable"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="text-xs font-bold text-primary">In Stock</FormLabel>
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                    {(createItem.isPending || updateItem.isPending) ? "Syncing..." : isEditing ? "Update Entry" : "Add to Menu"}
                </Button>
            </form>
        </Form>
    );
}

function AdminMenu() {
    const { data: menuItems, isLoading } = useMenu();
    const deleteItem = useDeleteMenuItem();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

    const categories = getMergedCategories(menuItems);

    const filteredItems = menuItems?.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategoryFilter === "all" || item.category === selectedCategoryFilter;
        return matchesSearch && matchesCategory;
    });

    if (isLoading) return <div className="p-20 text-center text-primary/30 font-black uppercase tracking-widest animate-pulse">Accessing Menu Database...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-primary tracking-tight uppercase italic">Menu Forge</h1>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60 italic">Catalogue Administration</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-14 px-8 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black uppercase tracking-widest shadow-xl shadow-accent/20 transition-all active:scale-95 flex items-center gap-3">
                            <Plus className="w-5 h-5" /> New Item Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[95vw] lg:max-w-[1100px] rounded-[3rem] border-none shadow-2xl p-8">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-3xl font-display text-primary tracking-tight">Post Bulk Entries</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground font-medium">Add multiple new culinary items to the menu database at once.</DialogDescription>
                        </DialogHeader>
                        <BulkMenuForm existingCategories={categories} onSuccess={() => setIsAddOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        className="pl-12 h-12 rounded-2xl bg-white border-border/40 font-medium text-sm shadow-sm"
                        placeholder="Search catalogue..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Dynamic Category Pill Filters */}
            <div className="flex flex-wrap gap-2 pb-2">
                <Button
                    variant={selectedCategoryFilter === "all" ? "default" : "outline"}
                    className={`h-9 rounded-full px-5 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategoryFilter === "all" ? "bg-accent shadow-lg shadow-accent/20" : "bg-white border-border/40 text-muted-foreground hover:bg-muted/50"}`}
                    onClick={() => setSelectedCategoryFilter("all")}
                >
                    All Categories
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={selectedCategoryFilter === cat ? "default" : "outline"}
                        className={`h-9 rounded-full px-5 text-[10px] font-black uppercase tracking-widest transition-all ${selectedCategoryFilter === cat ? "bg-accent shadow-lg shadow-accent/20" : "bg-white border-border/40 text-muted-foreground hover:bg-muted/50"}`}
                        onClick={() => setSelectedCategoryFilter(cat)}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Grid Layout for better responsiveness instead of table */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredItems?.map((item) => (
                        <motion.div
                            layout
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white p-6 rounded-[2rem] border border-border/40 shadow-sm hover:shadow-2xl transition-all duration-500 group"
                        >
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div className="w-16 h-16 rounded-[1.25rem] bg-muted/30 overflow-hidden border border-border/40 shrink-0 group-hover:scale-105 transition-transform duration-500">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Utensils className="w-8 h-8 text-primary/10 m-auto mt-4" />
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-widest bg-secondary/30 border-primary/10">
                                        {item.category}
                                    </Badge>
                                    <div className={`w-fit h-1.5 rounded-full ${item.isVeg ? "bg-green-500 w-8" : "bg-red-500 w-8"}`} title={item.isVeg ? "Veg" : "Non-Veg"} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-primary tracking-tight line-clamp-1">{item.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-medium leading-relaxed">{item.description}</p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-dashed border-border/60">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Price</span>
                                        <span className="font-black text-primary italic text-lg tracking-tighter">₹{Number(item.price).toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</span>
                                        <Badge className={`rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${item.isAvailable ? "bg-green-500/10 text-green-600 border-green-500/10" : "bg-red-500/10 text-red-600 border-red-500/10"}`}>
                                            {item.isAvailable ? "In Stock" : "Unavailable"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Dialog open={editingItem?.id === item.id} onOpenChange={(open) => !open && setEditingItem(null)}>
                                        <Button
                                            variant="ghost"
                                            className="flex-1 h-11 rounded-xl bg-secondary hover:bg-primary hover:text-white transition-all font-bold gap-2 text-primary"
                                            onClick={() => setEditingItem(item)}
                                        >
                                            <Edit2 className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Edit</span>
                                        </Button>
                                        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-8">
                                            <DialogHeader className="mb-6">
                                                <DialogTitle className="text-2xl font-display text-primary tracking-tight">Rebuild Entry</DialogTitle>
                                                <DialogDescription className="text-xs text-muted-foreground font-medium">Modify existing dish parameters and attributes.</DialogDescription>
                                            </DialogHeader>
                                            <MenuItemForm item={item} categories={categories} onSuccess={() => setEditingItem(null)} />
                                        </DialogContent>
                                    </Dialog>

                                    <Button
                                        variant="ghost"
                                        className="h-11 w-11 rounded-xl text-destructive hover:bg-destructive hover:text-white transition-all shadow-none"
                                        onClick={() => {
                                            if (confirm(`Expunge '${item.name}' from records?`)) deleteItem.mutate(item.id);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredItems?.length === 0 && (
                <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-border/60">
                    <Utensils className="w-12 h-12 text-primary/10 mx-auto mb-4" />
                    <p className="text-primary/40 font-black uppercase tracking-[0.4em] text-sm italic">Catalogue empty</p>
                </div>
            )}
        </div>
    );
}

export default AdminMenu;
