"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define what a single item in the cart looks like
export interface CartItem {
  id: string; // Unique ID (Product ID + Size)
  productId: string;
  name: string;
  price: number;
  size: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void; // <-- ADDED THIS
  clearCart: () => void;
  getCartTotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from local storage when the app starts
  useEffect(() => {
    const savedCart = localStorage.getItem("adaa_cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("adaa_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    setCartItems((prevItems) => {
      // Check if this exact product & size is already in the cart
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);
      
      if (existingItemIndex >= 0) {
        // If yes, just increase the quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      }
      // If no, add it as a new item
      return [...prevItems, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // <-- ADDED THIS NEW FUNCTION -->
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return; // Prevent negative quantities
    setCartItems((prevItems) => 
      prevItems.map((item) => 
        item.id === id ? { ...item, quantity: quantity } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);
  
  const getCartTotal = () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  
  const getTotalItems = () => cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    // <-- ADDED updateQuantity TO THE PROVIDER -->
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getTotalItems }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart easily
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}