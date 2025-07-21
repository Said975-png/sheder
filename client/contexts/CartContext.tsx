import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems((currentItems) => {
      // Проверяем, есть ли уже такой товар в корзине
      const existingItem = currentItems.find(
        (cartItem) => cartItem.id === item.id,
      );
      if (existingItem) {
        // Если товар уже есть, ничего не делаем (можно было бы увеличить количество)
        return currentItems;
      }
      // Добавляем новый товар
      return [...currentItems, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.length;
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const value = {
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
