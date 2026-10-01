import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface CartItem {
  dishId: number;
  dishName: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string | null;
}

interface CartState {
  restaurantId: number | null;
  restaurantName: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

interface CartContextValue extends CartState {
  addItem: (restaurantId: number, restaurantName: string, item: Omit<CartItem, "quantity">) => void;
  removeItem: (dishId: number) => void;
  updateQuantity: (dishId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "eatbf_cart";

function computeTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

function computeCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({
    restaurantId: null,
    restaurantName: "",
    items: [],
    total: 0,
    itemCount: 0,
  });

  useEffect(() => {
    AsyncStorage.getItem(CART_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setState({
            ...parsed,
            total: computeTotal(parsed.items),
            itemCount: computeCount(parsed.items),
          });
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((items: CartItem[], restaurantId: number | null, restaurantName: string) => {
    AsyncStorage.setItem(CART_KEY, JSON.stringify({ restaurantId, restaurantName, items }));
  }, []);

  const addItem = useCallback(
    (restaurantId: number, restaurantName: string, item: Omit<CartItem, "quantity">) => {
      setState((prev) => {
        let newItems: CartItem[];
        if (prev.restaurantId !== null && prev.restaurantId !== restaurantId) {
          newItems = [{ ...item, quantity: 1 }];
        } else {
          const idx = prev.items.findIndex((i) => i.dishId === item.dishId);
          if (idx >= 0) {
            newItems = prev.items.map((i, index) =>
              index === idx ? { ...i, quantity: i.quantity + 1 } : i
            );
          } else {
            newItems = [...prev.items, { ...item, quantity: 1 }];
          }
        }
        persist(newItems, restaurantId, restaurantName);
        return {
          restaurantId,
          restaurantName,
          items: newItems,
          total: computeTotal(newItems),
          itemCount: computeCount(newItems),
        };
      });
    },
    [persist]
  );

  const removeItem = useCallback(
    (dishId: number) => {
      setState((prev) => {
        const newItems = prev.items.filter((i) => i.dishId !== dishId);
        const newRestaurantId = newItems.length === 0 ? null : prev.restaurantId;
        persist(newItems, newRestaurantId, prev.restaurantName);
        return { ...prev, items: newItems, restaurantId: newRestaurantId, total: computeTotal(newItems), itemCount: computeCount(newItems) };
      });
    },
    [persist]
  );

  const updateQuantity = useCallback(
    (dishId: number, quantity: number) => {
      setState((prev) => {
        let newItems: CartItem[];
        if (quantity <= 0) {
          newItems = prev.items.filter((i) => i.dishId !== dishId);
        } else {
          newItems = prev.items.map((i) => (i.dishId === dishId ? { ...i, quantity } : i));
        }
        const newRestaurantId = newItems.length === 0 ? null : prev.restaurantId;
        persist(newItems, newRestaurantId, prev.restaurantName);
        return { ...prev, items: newItems, restaurantId: newRestaurantId, total: computeTotal(newItems), itemCount: computeCount(newItems) };
      });
    },
    [persist]
  );

  const clearCart = useCallback(() => {
    AsyncStorage.removeItem(CART_KEY);
    setState({ restaurantId: null, restaurantName: "", items: [], total: 0, itemCount: 0 });
  }, []);

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
