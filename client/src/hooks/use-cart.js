import { create } from "zustand";
import { persist } from "zustand/middleware";
const useCart = create()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      isOpen: false,
      setIsOpen: (open) => set({ isOpen: open }),
      addItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.id === item.id);
        let newItems;
        if (existing) {
          newItems = items.map(
            (i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        } else {
          newItems = [...items, { ...item, quantity: 1 }];
        }
        const total = newItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
        set({ items: newItems, total }); // Auto-open cart disabled when item added
      },
      removeItem: (itemId) => {
        const newItems = get().items.filter((i) => i.id !== itemId);
        const total = newItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
        set({ items: newItems, total });
      },
      updateQuantity: (itemId, delta) => {
        const items = get().items;
        const newItems = items.map((i) => {
          if (i.id === itemId) {
            const newQty = Math.max(0, i.quantity + delta);
            return { ...i, quantity: newQty };
          }
          return i;
        }).filter((i) => i.quantity > 0);
        const total = newItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
        set({ items: newItems, total });
      },
      clearCart: () => set({ items: [], total: 0, isOpen: false })
    }),
    {
      name: "parsik-cart",
      partialize: (state) => ({ items: state.items, total: state.total }), // Don't persist isOpen
    }
  )
);
export {
  useCart
};
