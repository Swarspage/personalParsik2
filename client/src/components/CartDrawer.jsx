import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Minus, Plus, Trash2, ShoppingBag, ChevronRight, MessageSquare, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation, useSearch } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useOpenOrders, useCreateDraftOrder, useCheckoutTable, useCancelDraftOrder } from "@/hooks/use-orders";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

function CartDrawer({ open, onClose }) {
  // Staged Items (Local Cart)
  const { items: cartItems, removeItem, updateQuantity, clearCart } = useCart();
  
  // Active Order Items (Sent to kitchen)
  const { data: openOrders = [], isLoading } = useOpenOrders();
  const createOrder = useCreateDraftOrder();
  const checkoutTable = useCheckoutTable();
  const cancelOrder = useCancelDraftOrder();
  const [, setLocation] = useLocation();

  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const tableFromUrl = searchParams.get("table");

  const [specialInstructions, setSpecialInstructions] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("card");

  // Sum up everything across all open tickets
  const activeItemsCount = openOrders.reduce((acc, order) => acc + (order.items?.length || 0), 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  const activeSubtotal = openOrders.reduce((acc, order) => acc + Number(order.subtotal || 0), 0);
  const activeTotal = openOrders.reduce((acc, order) => acc + Number(order.totalAmount || 0), 0);

  const handleUpdateCartQuantity = (item, delta) => {
    if (item.quantity + delta === 0) {
      removeItem(item.id);
    } else {
      updateQuantity(item.id, delta);
    }
  };

  const handleOrderItems = () => {
    if (cartItems.length === 0) return;
    
    createOrder.mutate({
      items: cartItems,
      orderDetails: {
        tableNumber: tableFromUrl ? parseInt(tableFromUrl) : undefined,
        specialRequests: specialInstructions || undefined
      }
    }, {
      onSuccess: () => {
        clearCart();
        setSpecialInstructions("");
      },
      onError: (err) => {
        if (err.message.includes("log in")) {
          onClose();
          setLocation("/auth");
        }
      }
    });
  };

  const handleCheckout = () => {
    if (openOrders.length > 0) {
      checkoutTable.mutate({ paymentMethod }, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };
  
  const handleCancelActiveOrder = (orderId) => {
    if (confirm("Are you sure you want to cancel this specific ticket?")) {
      cancelOrder.mutate(orderId);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-[#FDFCFB] p-0 border-l border-border/40 shadow-2xl">
        <SheetHeader className="p-6 border-b border-border/40 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <SheetTitle className="font-display text-2xl font-black text-primary uppercase italic tracking-tighter">Your Table</SheetTitle>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${activeItemsCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-primary/20'}`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                  {activeItemsCount > 0 ? 'Orders Active' : 'Selection Phase'}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {cartItems.length === 0 && activeItemsCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="w-24 h-24 rounded-[2.5rem] bg-muted/20 flex items-center justify-center border border-dashed border-border/60">
              <ShoppingBag className="w-10 h-10 text-primary/10" />
            </div>
            <div className="space-y-2">
              <h4 className="font-display text-xl font-bold text-primary">Your table is empty</h4>
              <p className="text-sm text-muted-foreground font-medium max-w-[200px] leading-relaxed">Add items from the menu to start your order.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                setLocation("/menu");
              }}
              className="h-12 rounded-2xl px-8 border-2 border-primary/10 font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all"
            >
              Browse Menu
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-8">
                
                {/* 1. Unsent / Staged Items (useCart) */}
                {cartItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5" /> Unsent Items
                      </h4>
                      <Badge className="bg-primary/10 text-primary border-none shadow-none text-[8px] font-bold uppercase tracking-widest">
                        Ready to Order
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout" initial={false}>
                        {cartItems.map((item) => (
                          <motion.div
                            layout
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex gap-4 group p-4 bg-white rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20" />
                            <div className="flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-sm text-primary tracking-tight leading-tight line-clamp-1">{item.dishName}</h4>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-muted-foreground/30 hover:text-destructive transition-colors shrink-0 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mb-3">
                                <p className="text-[11px] font-black text-accent italic tracking-tighter">₹{Number(item.price).toFixed(2)}</p>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center bg-secondary/50 rounded-xl p-1">
                                  <button
                                    onClick={() => handleUpdateCartQuantity(item, -1)}
                                    className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center transition-colors shadow-sm"
                                  >
                                    <Minus className="w-3 h-3 text-primary" />
                                  </button>
                                  <span className="w-8 text-center text-xs font-black text-primary">{item.quantity}</span>
                                  <button
                                    onClick={() => handleUpdateCartQuantity(item, 1)}
                                    className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center transition-colors shadow-sm"
                                  >
                                    <Plus className="w-3 h-3 text-primary" />
                                  </button>
                                </div>
                                <span className="text-xs font-black text-primary italic">₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Instruction Box & Order Button */}
                    <div className="bg-secondary/40 p-4 rounded-2xl border border-border/40 space-y-4">
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/40" />
                        <Input
                          placeholder="Cooking instructions / special requests..."
                          className="pl-9 h-10 text-xs bg-white border-none shadow-sm rounded-xl focus-visible:ring-accent"
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleOrderItems}
                        disabled={createOrder.isPending}
                        className="w-full h-12 rounded-xl bg-primary text-white font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 active:scale-95 transition-all text-[10px]"
                      >
                        {createOrder.isPending ? "Sending to Kitchen..." : "Order Selected Items"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* 2. Active / Ordered Items (useOpenOrders) */}
                {activeItemsCount > 0 && (
                  <div className="space-y-6 pt-4 relative">
                    {cartItems.length > 0 && <div className="absolute top-0 left-4 right-4 h-[1px] bg-border/40" />}
                    
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" /> Kitchen Tickets
                      </h4>
                      <Badge className="bg-indigo-500/10 text-indigo-600 border-none shadow-none text-[8px] font-bold uppercase tracking-widest">
                        Cooking & Served
                      </Badge>
                    </div>

                    <div className="space-y-6">
                      {openOrders.map((order) => (
                        <div key={order.id} className="space-y-3 p-4 border border-indigo-500/10 bg-indigo-50/30 rounded-2xl relative">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase text-indigo-800 tracking-widest">Ticket #{order.id.toString().slice(-4)}</span>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-[8px] font-bold uppercase tracking-widest border-none shadow-none ${
                                order.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                                order.status === 'preparing' ? 'bg-blue-500/10 text-blue-600' :
                                order.status === 'served' ? 'bg-emerald-500/10 text-emerald-600' :
                                'bg-primary/10 text-primary'
                              }`}>
                                {order.status}
                              </Badge>
                              {order.status === 'pending' && (
                                <button onClick={() => handleCancelActiveOrder(order.id)} className="text-destructive/50 hover:text-destructive">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {Array.isArray(order.items) && order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm relative overflow-hidden group">
                              <div className="flex items-center gap-3 pl-2">
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-500/10 px-2 py-0.5 rounded-lg">{item.quantity}x</span>
                                <div>
                                  <p className="text-[11px] font-bold text-primary">{item.dishName || item.dishId}</p>
                                  {item.appliedOfferTitle && (
                                    <p className="text-[9px] text-accent font-semibold">{item.appliedOfferTitle}</p>
                                  )}
                                </div>
                              </div>
                              <span className="text-[11px] font-black text-primary/70">₹{(Number(item.price) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}

                          {order.specialRequests && (
                            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex gap-2 items-start mt-2">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                              <p className="text-[10px] font-medium text-amber-800/80 leading-relaxed italic border-l border-amber-200 pl-2">
                                "{order.specialRequests}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Bottom Footer Action Area */}
            {activeItemsCount > 0 && (
              <div className="bg-white border-t border-border/40 shadow-[0_-15px_30px_rgba(0,0,0,0.03)] shrink-0">
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground opacity-80">
                      <span>Ordered Subtotal</span>
                      <span className="text-primary font-bold">₹{activeSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground opacity-60">
                      <span>Tax (5%)</span>
                      <span className="text-primary font-semibold">₹{(activeSubtotal * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-dashed border-border flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-primary">Table Total</span>
                        <span className="text-[9px] text-muted-foreground font-medium opacity-50">Incl. all taxes</span>
                      </div>
                      <span className="text-2xl font-display text-accent">₹{activeTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4 bg-secondary/30 p-1.5 rounded-2xl border border-border/40">
                    <Button 
                      variant={paymentMethod === 'card' ? 'default' : 'ghost'} 
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 h-8 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-none ${paymentMethod === 'card' ? 'bg-white text-primary shadow-sm hover:bg-white' : 'text-muted-foreground hover:bg-white/50 hover:text-primary'} transition-all`}
                    >Card</Button>
                    <Button 
                      variant={paymentMethod === 'upi' ? 'default' : 'ghost'} 
                      onClick={() => setPaymentMethod('upi')}
                      className={`flex-1 h-8 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-none ${paymentMethod === 'upi' ? 'bg-white text-primary shadow-sm hover:bg-white' : 'text-muted-foreground hover:bg-white/50 hover:text-primary'} transition-all`}
                    >UPI</Button>
                    <Button 
                      variant={paymentMethod === 'cash' ? 'default' : 'ghost'} 
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex-1 h-8 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-none ${paymentMethod === 'cash' ? 'bg-white text-primary shadow-sm hover:bg-white' : 'text-muted-foreground hover:bg-white/50 hover:text-primary'} transition-all`}
                    >Cash</Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCheckout}
                      disabled={checkoutTable.isPending || cartItems.length > 0}
                      className="w-full h-14 rounded-[1.25rem] bg-indigo-950 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 hover:scale-[1.02] active:scale-95 transition-all text-[10px] group disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                      {checkoutTable.isPending ? "Contacting Staff..." : (
                        cartItems.length > 0 ? "Order pending items first" : "Checkout table"
                      )}
                    </Button>
                  </div>
                  {cartItems.length === 0 && (
                    <p className="text-center text-[9px] font-medium text-muted-foreground opacity-60">
                      Checking out will disable ordering and finalize your bill.
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* If no active items but we only have staged items... */}
            {activeItemsCount === 0 && cartItems.length > 0 && (
              <div className="p-6 bg-white border-t border-border/40 shadow-[0_-15px_30px_rgba(0,0,0,0.03)] space-y-3 shrink-0">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground opacity-80">
                  <span>New Subtotal</span>
                  <span className="text-primary font-bold">₹{cartSubtotal.toFixed(2)}</span>
                </div>
                <p className="text-center text-[9px] font-medium text-muted-foreground opacity-60 pt-2">
                  Please click "Order Selected Items" above to process these items.
                </p>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export { CartDrawer };
