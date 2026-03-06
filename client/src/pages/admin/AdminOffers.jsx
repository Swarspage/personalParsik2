import { useState, useMemo } from "react";
import { useOffers, useCreateOffer, useUpdateOffer, useDeleteOffer, useToggleOffer } from "@/hooks/use-offers";
import { useMenu } from "@/hooks/use-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isPast, isFuture } from "date-fns";
import { Plus, Search, Tag, Percent, Trash2, Edit2, Play, Pause, AlertCircle, ChevronsUpDown, Check } from "lucide-react";

function OfferForm({ offer, menuItems, onSuccess }) {
    const createOffer = useCreateOffer();
    const updateOffer = useUpdateOffer();
    const isEditing = !!offer;
    const [openMenuDialog, setOpenMenuDialog] = useState(false);

    const [formData, setFormData] = useState(
        offer || {
            menuItemId: "",
            discountType: "percentage",
            discountValue: "",
            title: "",
            description: "",
            startDate: new Date().toISOString().slice(0, 16),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
            isActive: true,
            maxUsageCount: "",
            minOrderValue: "",
            branch: "all",
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            menuItemId: Number(formData.menuItemId),
            discountValue: formData.discountValue.toString(),
            maxUsageCount: formData.maxUsageCount ? Number(formData.maxUsageCount) : null,
            minOrderValue: formData.minOrderValue ? formData.minOrderValue.toString() : null,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
        };

        if (isEditing) {
            updateOffer.mutate(
                { id: offer.id, data: payload },
                { onSuccess: () => onSuccess?.() }
            );
        } else {
            createOffer.mutate(payload, { onSuccess: () => onSuccess?.() });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Menu Item</label>
                    <Popover open={openMenuDialog} onOpenChange={setOpenMenuDialog}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={openMenuDialog}
                                className="w-full justify-between h-10 font-medium"
                            >
                                {formData.menuItemId
                                    ? menuItems?.find((item) => item.id.toString() === formData.menuItemId.toString())?.name
                                    : "Search a dish..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search dishes..." />
                                <CommandList>
                                    <CommandEmpty>No dish found.</CommandEmpty>
                                    <CommandGroup>
                                        {menuItems?.map((item) => (
                                            <CommandItem
                                                key={item.id}
                                                value={item.name}
                                                onSelect={() => {
                                                    setFormData({ ...formData, menuItemId: item.id.toString() });
                                                    setOpenMenuDialog(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        formData.menuItemId.toString() === item.id.toString() ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {item.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Offer Title</label>
                    <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Weekend Special, Happy Hour"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discount Type</label>
                    <Select
                        value={formData.discountType}
                        onValueChange={(val) => setFormData({ ...formData, discountType: val })}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Discount Value</label>
                    <Input
                        type="number"
                        min="0"
                        step="any"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        placeholder={formData.discountType === "percentage" ? "e.g. 20" : "e.g. 50"}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Start Date & Time</label>
                    <Input
                        type="datetime-local"
                        value={formatDatetimeForInput(formData.startDate)}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">End Date & Time</label>
                    <Input
                        type="datetime-local"
                        value={formatDatetimeForInput(formData.endDate)}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Branch</label>
                    <Select
                        value={formData.branch}
                        onValueChange={(val) => setFormData({ ...formData, branch: val })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Branches</SelectItem>
                            <SelectItem value="airoli">Airoli Knowledge Park</SelectItem>
                            <SelectItem value="thane">Thane Platinum</SelectItem>
                            <SelectItem value="powai">Powai Elite</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Max Redemptions (Optional)</label>
                    <Input
                        type="number"
                        min="1"
                        value={formData.maxUsageCount || ""}
                        onChange={(e) => setFormData({ ...formData, maxUsageCount: e.target.value })}
                        placeholder="e.g. 100"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Terms and conditions, promo details..."
                    className="resize-none"
                />
            </div>

            <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold tracking-widest uppercase transition-colors rounded-xl h-12 mt-4"
                disabled={createOffer.isPending || updateOffer.isPending}
            >
                {isEditing ? "Update Offer" : "Launch Offer"}
            </Button>
        </form>
    );
}

// Helper to format date object to datetime-local string
function formatDatetimeForInput(dateInput) {
    if (!dateInput) return "";
    try {
        const d = new Date(dateInput);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch (e) {
        return "";
    }
}

export default function AdminOffers() {
    const { data: offers, isLoading: offersLoading } = useOffers();
    const { data: menuItems, isLoading: menuLoading } = useMenu();
    const deleteOffer = useDeleteOffer();
    const toggleOffer = useToggleOffer();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingOffer(null);
    };

    const getOfferStatus = (offer) => {
        if (!offer.isActive) return "Paused";
        const now = new Date();
        const end = new Date(offer.endDate);
        const start = new Date(offer.startDate);

        if (isPast(end)) return "Expired";
        if (isFuture(start)) return "Scheduled";
        return "Active";
    };

    const filteredOffers = useMemo(() => {
        if (!offers) return [];
        return offers.filter(offer => {
            const menuItem = menuItems?.find(m => m.id === offer.menuItemId);
            const searchMatch = menuItem?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                offer.title.toLowerCase().includes(searchQuery.toLowerCase());

            const st = getOfferStatus(offer).toLowerCase();
            const statusMatch = statusFilter === "all" || st === statusFilter;

            return searchMatch && statusMatch;
        });
    }, [offers, menuItems, searchQuery, statusFilter]);

    if (offersLoading || menuLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-accent rounded-full animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/30 italic">Loading Offers Data...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display text-primary tracking-tight">Active Promotions</h1>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mt-1">
                        Yield Management & Discount Configuration
                    </p>
                </div>

                <div className="flex gap-3 items-center">
                    <Badge className="bg-accent/10 text-accent hover:bg-accent/20 border-none transition-colors">
                        {offers?.filter(o => getOfferStatus(o) === "Active").length || 0} Live Now
                    </Badge>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setEditingOffer(null);
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] h-10 px-5 shadow-lg shadow-primary/25 transition-all">
                                <Plus className="w-4 h-4 mr-2" /> New Offer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] border-none rounded-[2rem] p-6 shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-display text-primary flex items-center gap-2">
                                    <Tag className="w-6 h-6 text-accent" />
                                    {editingOffer ? "Modify Promotion" : "Create New Promotion"}
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    Configure promotion details and specific menu parameters.
                                </DialogDescription>
                            </DialogHeader>
                            <OfferForm
                                offer={editingOffer}
                                menuItems={menuItems}
                                onSuccess={closeDialog}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                    <Input
                        className="h-12 pl-12 rounded-2xl border-border/40 bg-white shadow-sm font-bold text-xs"
                        placeholder="Search offers or menu items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-12 rounded-2xl border-border/40 bg-white shadow-sm font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active Now</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOffers.map((offer) => {
                    const menuItem = menuItems?.find(m => m.id === offer.menuItemId);
                    const status = getOfferStatus(offer);
                    const isPercentage = offer.discountType === "percentage";

                    let statusColor = "bg-primary/10 text-primary";
                    if (status === "Active") statusColor = "bg-emerald-500/10 text-emerald-600";
                    if (status === "Expired") statusColor = "bg-destructive/10 text-destructive";
                    if (status === "Paused") statusColor = "bg-amber-500/10 text-amber-600";
                    if (status === "Scheduled") statusColor = "bg-blue-500/10 text-blue-600";

                    return (
                        <div key={offer.id} className="bg-white rounded-[2rem] p-6 border border-border/40 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Badge className={`${statusColor} border-none font-bold uppercase tracking-widest text-[9px] px-2 py-0.5 mb-2`}>
                                        {status}
                                    </Badge>
                                    <h3 className="font-bold text-primary text-lg leading-tight group-hover:text-accent transition-colors">{offer.title}</h3>
                                    <p className="text-xs font-semibold text-muted-foreground mt-1">For: {menuItem?.name || "Unknown Item"}</p>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                                    <span className="font-display font-black text-accent flex items-center">
                                        {isPercentage ? "" : "₹"}{offer.discountValue}{isPercentage ? <Percent className="w-3 h-3 ml-0.5" /> : ""}
                                    </span>
                                </div>
                            </div>

                            {offer.description && (
                                <p className="text-xs text-muted-foreground/80 italic line-clamp-2 mb-4">
                                    "{offer.description}"
                                </p>
                            )}

                            <div className="space-y-3 mt-auto pt-4 border-t border-border/40">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <span>Validity</span>
                                    <span className="text-primary/70">{format(new Date(offer.endDate), "MMM do, h:mm a")}</span>
                                </div>

                                {offer.maxUsageCount && (
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            <span>Redemptions Limit</span>
                                            <span className="text-accent">{offer.currentUsageCount || 0} / {offer.maxUsageCount}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-accent"
                                                style={{ width: `${Math.min(100, ((offer.currentUsageCount || 0) / offer.maxUsageCount) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`flex-1 h-9 rounded-xl text-[10px] font-bold uppercase tracking-widest ${offer.isActive ? 'text-amber-600 border-amber-600/20 hover:bg-amber-600/10' : 'text-emerald-600 border-emerald-600/20 hover:bg-emerald-600/10'}`}
                                    onClick={() => toggleOffer.mutate(offer.id)}
                                >
                                    {offer.isActive ? <><Pause className="w-3 h-3 mr-1.5" /> Pause</> : <><Play className="w-3 h-3 mr-1.5" /> Resume</>}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-xl border-border/40 hover:bg-secondary/50 text-muted-foreground"
                                    onClick={() => {
                                        setEditingOffer(offer);
                                        setIsDialogOpen(true);
                                    }}
                                >
                                    <Edit2 className="w-3.5 h-3.5" />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0 rounded-xl border-destructive/20 hover:bg-destructive/10 text-destructive"
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this promotion completely?")) {
                                            deleteOffer.mutate(offer.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    );
                })}

                {filteredOffers.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white/50 border border-dashed border-border/40 rounded-[2rem] flex flex-col items-center justify-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground/20 mb-3" />
                        <h3 className="font-display text-xl text-primary/60 mb-1">No Promotions Found</h3>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Try adjusting your filters or create a new offer.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
