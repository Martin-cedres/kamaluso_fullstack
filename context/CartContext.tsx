import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import Toast from '../components/Toast'

// Define the shape of a cart item
export interface CartItem {
  _id: string
  nombre: string
  precio: number
  imageUrl?: string
  categoria?: string
  quantity: number
  finish?: string // Acabado del producto
  selections?: Record<string, string> // Nuevo campo para personalizaciones
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
  appliedCoupon?: AppliedCoupon | null
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void
  cartIconAnimate: boolean
  // New fields for promotion logic
  totalBeforeDiscount: number
  discountAmount: number
  finalTotal: number
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

// Helper to generate a unique ID for a cart item based on product ID and selections/finish
export const getCartItemId = (product: { _id: string; finish?: string; selections?: Record<string, string> }) => {
  if (product.selections && Object.keys(product.selections).length > 0) {
    const selectionString = Object.entries(product.selections)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}:${value}`)
      .join('|');
    return `${product._id}-${selectionString}`;
  }
  return product.finish ? `${product._id}-${product.finish}` : product._id
}

// Create the provider component
interface CartProviderProps {
  children: React.ReactNode;
}


export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [cartIconAnimate, setCartIconAnimate] = useState(false)

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

    // Show toast notification
    setToastMessage(`${product.nombre} agregado al carrito`)
    setShowToast(true)

    // Trigger cart icon animation
    setCartIconAnimate(true)
    setTimeout(() => setCartIconAnimate(false), 500)
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

  // Calculate totals and automatic discount (10% if 2+ items)
  const totalBeforeDiscount = cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0)
  const isDiscountEligible = cartCount >= 2;
  // Apply 10% discount if eligible
  const automaticDiscount = isDiscountEligible ? totalBeforeDiscount * 0.10 : 0;

  // Also consider applied coupon (if any)
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;

  // Total discount (automatic + coupon, though usually one overrides the other, let's sum them or prioritize automatic?)
  // For now, let's sum them but maybe the user wants automatic OR coupon. 
  // Given the instruction "Aplica un 10%", let's imply it serves as a base.
  const discountAmount = automaticDiscount + couponDiscount;

  const finalTotal = Math.max(0, totalBeforeDiscount - discountAmount);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    appliedCoupon,
    setAppliedCoupon,
    cartIconAnimate,
    totalBeforeDiscount,
    discountAmount,
    finalTotal
  }

  return (
    <CartContext.Provider value={value}>
      {children}
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </CartContext.Provider>
  )
}

