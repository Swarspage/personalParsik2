import { useState } from "react";
import { useCreateMenuItemsBulk } from "@/hooks/use-menu";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function BulkMenuForm({ onSuccess, existingCategories }) {
    const createBulk = useCreateMenuItemsBulk();
    const [categories, setCategories] = useState(existingCategories);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

    const generateRow = () => ({
        id: crypto.randomUUID(),
        name: "",
        description: "",
        price: "",
        category: categories[0] || "Beverages",
        imageUrl: "",
        isVeg: true,
        isAvailable: true,
        branch: "all"
    });

    const [rows, setRows] = useState([generateRow(), generateRow(), generateRow()]);

    const addRow = () => setRows([...rows, generateRow()]);
    const removeRow = (id) => setRows(rows.filter(r => r.id !== id));
    const updateRow = (id, field, value) => setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));

    const handleAddCategory = () => {
        const cat = newCategoryName.trim();
        if (cat && !categories.includes(cat)) {
            setCategories([...categories, cat]);
            setIsCreatingCategory(false);
            setNewCategoryName("");
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const validRows = rows.filter(r => r.name.trim() && r.price !== "");
        if (validRows.length === 0) {
            alert("Please fill in at least one item with a name and price.");
            return;
        }

        const payload = validRows.map(r => ({
            name: r.name,
            description: r.description,
            price: r.price.toString(),
            category: r.category,
            imageUrl: r.imageUrl,
            isVeg: r.isVeg,
            isAvailable: r.isAvailable,
            branch: r.branch
        }));

        createBulk.mutate(payload, {
            onSuccess: () => {
                onSuccess();
            }
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6 flex flex-col h-[70vh]">
            <div className="flex justify-between items-center mb-2 shrink-0">
                <p className="text-sm font-medium text-muted-foreground bg-accent/10 text-accent px-4 py-2 rounded-xl italic">
                    Hint: Only rows with a <strong className="font-black">Name</strong> and <strong className="font-black">Price</strong> will be saved. Empty rows are ignored.
                </p>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={addRow} className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] border-primary/20 text-primary hover:bg-primary/5">
                        <Plus className="w-4 h-4 mr-2" /> Add Row
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1 border border-border/40 rounded-3xl bg-muted/10 p-4">
                <div className="min-w-[1000px] space-y-3 pb-4">
                    {/* Header Row */}
                    <div className="grid grid-cols-[2fr_3fr_1fr_1.5fr_2fr_0.5fr_0.5fr_auto] gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40">
                        <div>Name *</div>
                        <div>Description</div>
                        <div>Price (₹) *</div>
                        <div>Category *</div>
                        <div>Image URL</div>
                        <div className="text-center">Veg</div>
                        <div className="text-center">Stock</div>
                        <div className="w-10"></div>
                    </div>

                    {/* Form Rows */}
                    {rows.map((row, index) => (
                        <div key={row.id} className="grid grid-cols-[2fr_3fr_1fr_1.5fr_2fr_0.5fr_0.5fr_auto] gap-3 items-start bg-white p-3 rounded-2xl shadow-sm border border-border/20 group">
                            <Input
                                placeholder="Item name"
                                value={row.name}
                                onChange={(e) => updateRow(row.id, "name", e.target.value)}
                                className={`h-11 rounded-xl ${!row.name.trim() && row.price ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                            />

                            <Textarea
                                placeholder="Description (optional)"
                                value={row.description}
                                onChange={(e) => updateRow(row.id, "description", e.target.value)}
                                className="min-h-[44px] h-11 resize-none rounded-xl"
                            />

                            <Input
                                type="number"
                                placeholder="0.00"
                                value={row.price}
                                onChange={(e) => updateRow(row.id, "price", e.target.value)}
                                className={`h-11 rounded-xl ${row.name.trim() && !row.price ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                            />

                            <Select value={row.category} onValueChange={(val) => {
                                if (val === "new_category_trigger") {
                                    setIsCreatingCategory(true);
                                } else {
                                    updateRow(row.id, "category", val);
                                }
                            }}>
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                    <div className="h-px bg-border/50 my-1 mx-2" />
                                    <SelectItem value="new_category_trigger" className="font-bold text-accent justify-center">
                                        <Plus className="w-3 h-3 mr-2" /> New Category
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="https://"
                                value={row.imageUrl}
                                onChange={(e) => updateRow(row.id, "imageUrl", e.target.value)}
                                className="h-11 rounded-xl text-xs"
                            />

                            <div className="flex justify-center h-11 items-center">
                                <Checkbox
                                    checked={row.isVeg}
                                    onCheckedChange={(checked) => updateRow(row.id, "isVeg", checked)}
                                />
                            </div>

                            <div className="flex justify-center h-11 items-center">
                                <Checkbox
                                    checked={row.isAvailable}
                                    onCheckedChange={(checked) => updateRow(row.id, "isAvailable", checked)}
                                />
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => removeRow(row.id)}
                                className="w-10 h-11 shrink-0 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Inline Category Creation Dialog-like Overlay inside the form area */}
            {isCreatingCategory && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-3xl pb-10">
                    <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-4 border border-border/50">
                        <h4 className="font-display text-xl font-bold text-primary">Add New Category</h4>
                        <Input
                            autoFocus
                            placeholder="e.g. Continental, Smoothies..."
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCategory();
                                }
                            }}
                            className="h-12 rounded-xl"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="ghost" className="rounded-xl" onClick={() => {
                                setIsCreatingCategory(false);
                                setNewCategoryName("");
                            }}>Cancel</Button>
                            <Button type="button" onClick={handleAddCategory} className="rounded-xl bg-accent text-white font-bold tracking-wider">Add</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="pt-2 shrink-0">
                <Button
                    type="submit"
                    disabled={createBulk.isPending}
                    className="w-full h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-95 transition-all text-[11px] group"
                >
                    {createBulk.isPending ? "Syncing Batch to Database..." : "Commit All Rows to Database"}
                    {!createBulk.isPending && <CheckCircle2 className="ml-3 w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />}
                </Button>
            </div>
        </form>
    );
}
