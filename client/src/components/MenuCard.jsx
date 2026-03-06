import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { forwardRef } from "react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/use-cart";
import { useLocation, useSearch } from "wouter";

const MenuCard = forwardRef(({ item, activeOffers }, ref) => {
  const { items, addItem, removeItem } = useCart();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const tableFromUrl = searchParams.get("table");
  const [, setLocation] = useLocation();

  const cartItem = items?.find(i => i.dishId === item.id);
  const quantity = cartItem?.quantity || 0;

  // Derive if it's a specialty item (for demo purposes, items with price > 400 are 'Signature')
  const isSignature = item.price > 400;

  const applicableOffer = activeOffers?.find(o => o.menuItemId === item.id);

  let currentPrice = Number(item.price);
  if (applicableOffer) {
    if (applicableOffer.discountType === "percentage") {
      currentPrice = currentPrice - (currentPrice * (Number(applicableOffer.discountValue) / 100));
    } else {
      currentPrice = Math.max(0, currentPrice - Number(applicableOffer.discountValue));
    }
  }

  const handleAdd = (qtyDelta = 1) => {
    if (qtyDelta > 0) {
      const itemToAdd = {
        id: item.id,
        dishId: item.id,
        dishName: item.name,
        price: currentPrice.toString(),
        originalPrice: applicableOffer ? item.price : null,
        appliedOfferTitle: applicableOffer?.title || null,
        quantity: 1 // useCart's addItem adds 1 by default or we can just call it
      };
      addItem(itemToAdd);
    } else {
      removeItem(item.id);
    }
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-[3rem] overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.08)] hover:shadow-[0_60px_100px_-30px_rgba(25,48,28,0.18)] transition-all duration-700 border border-border/30 flex flex-col h-full relative"
    >
      <div className="aspect-[5/4] overflow-hidden relative">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform [transition-duration:2.5s] ease-out group-hover:scale-110"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700" />

        {/* Badges Container */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
          <div className="flex flex-col gap-2">
            {item.isVeg ? (
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/50">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/50">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 items-end">
            {isSignature && (
              <Badge className="bg-accent text-white border-none text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full h-auto shadow-lg shadow-accent/20">
                Signature
              </Badge>
            )}
            {applicableOffer && (
              <Badge className="bg-red-500 text-white border-none text-[10px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full h-auto shadow-lg shadow-red-500/30">
                {applicableOffer.discountType === 'percentage' ? `${applicableOffer.discountValue}% OFF` : `₹${applicableOffer.discountValue} OFF`}
              </Badge>
            )}
          </div>
        </div>

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-[4px] flex items-center justify-center">
            <div className="bg-white/95 px-8 py-3 rounded-2xl shadow-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Out of Stock</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 md:p-10 flex flex-col flex-1 gap-6">
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent/80 italic">{item.category} Collection</span>
              <h3 className="font-display text-2xl md:text-3xl font-normal text-primary leading-tight tracking-tight">
                {item.name}
              </h3>
            </div>
            <div className="shrink-0 pt-1 flex flex-col items-end">
              {applicableOffer ? (
                <>
                  <div className="flex items-center gap-1 opacity-50 line-through">
                    <span className="text-sm font-display text-muted-foreground italic tracking-tighter">₹</span>
                    <span className="text-sm font-display text-muted-foreground tracking-tighter italic">{Number(item.price).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-display text-2xl text-accent italic font-light tracking-tighter">₹</span>
                    <span className="font-display text-2xl text-accent font-bold tracking-tighter italic">{currentPrice.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center">
                  <span className="font-display text-2xl text-primary/40 italic font-light tracking-tighter">₹</span>
                  <span className="font-display text-2xl text-primary font-normal tracking-tighter italic">{Number(item.price).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-xs md:text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed opacity-70 border-l border-accent/20 pl-4 py-1">
          {item.description}
        </p>

        <div className="pt-4 mt-auto">
          <AnimatePresence mode="wait">
            {quantity > 0 ? (
              <motion.div
                key="quantity-control"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full h-[60px] rounded-2xl flex items-center justify-between px-2 py-1 border-2 border-primary/20 bg-primary/5 shadow-sm relative overflow-hidden"
              >
                <button
                  onClick={() => handleAdd(-1)}
                  disabled={quantity <= 0}
                  className="w-12 h-12 rounded-xl hover:bg-white flex items-center justify-center text-primary transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-black text-lg text-primary leading-none">{quantity}</span>
                  <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary/60 mt-1">selected</span>
                </div>
                <button
                  onClick={() => handleAdd(1)}
                  className="w-12 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <Button
                key="add"
                onClick={() => handleAdd(1)}
                disabled={!item.isAvailable}
                className="w-full h-15 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] bg-primary text-white shadow-xl shadow-primary/10 hover:shadow-primary/30 active:scale-95 transition-all duration-500 relative group/btn overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2">
                  Add to Selection
                </div>
                {/* Subtle shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              </Button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
});

MenuCard.displayName = "MenuCard";

export { MenuCard };
