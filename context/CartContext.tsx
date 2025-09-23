import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

// Define the shape of a cart item
export interface CartItem {
  _id: string
  nombre: string
  precio: number
  imageUrl?: string
  categoria?: string
  quantity: number
  finish?: string // Acabado del producto
}

// Define the shape of an applied coupon
interface AppliedCoupon {
  code: string
  discountAmount: number
}

// Define the shape of the context
interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  appliedCoupon?: AppliedCoupon
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Create a custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Helper to generate a unique ID for a cart item based on product ID and finish
export const getCartItemId = (product: { _id: string; finish?: string }) => {
  return product.finish ? `${product._id}-${product.finish}` : product._id
}

// Create the provider component
interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('shoppingCart')
      if (storedCart) {
        setCartItems(JSON.parse(storedCart))
      }
      const storedCoupon = localStorage.getItem('appliedCoupon')
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon))
      }
    } catch (error) {
      console.error('Failed to parse data from localStorage', error)
      setCartItems([])
      setAppliedCoupon(null)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems))
  }, [cartItems])

  // Save appliedCoupon to localStorage whenever it changes
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon))
    } else {
      localStorage.removeItem('appliedCoupon')
    }
  }, [appliedCoupon])

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    const cartItemId = getCartItemId(product)
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => getCartItemId(item) === cartItemId,
      )
      if (existingItem) {
        // Increase quantity if item with same finish already exists
        return prevItems.map((item) =>
          getCartItemId(item) === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      // Add new item with quantity 1
      return [...prevItems, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => getCartItemId(item) !== cartItemId),
    )
  }

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId)
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          getCartItemId(item) === cartItemId ? { ...item, quantity } : item,
        ),
      )
    }
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    appliedCoupon,
    setAppliedCoupon,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
