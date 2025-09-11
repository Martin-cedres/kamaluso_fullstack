import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of a cart item
interface CartItem {
  _id: string;
  nombre: string;
  precio: number;
  imageUrl?: string;
  categoria?: string; // Added
  quantity: number;
}

// Define the shape of an applied coupon
interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

// Define the shape of the context
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  appliedCoupon?: AppliedCoupon; // Added
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void; // Added
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Create the provider component
interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null); // Added

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('shoppingCart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      const storedCoupon = localStorage.getItem('appliedCoupon'); // Added
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon)); // Added
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error); // Generalize error message
      setCartItems([]);
      setAppliedCoupon(null); // Reset coupon on error
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save appliedCoupon to localStorage whenever it changes (Added)
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
  }, [appliedCoupon]);

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Add new item with quantity 1
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    appliedCoupon, // Added
    setAppliedCoupon, // Added
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
