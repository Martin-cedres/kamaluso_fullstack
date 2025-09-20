import Coupon from '@/models/Coupon';

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  category: string;
}

interface ValidationResult {
  success: boolean;
  message: string;
  discountAmount?: number;
  newCartTotal?: number;
  couponCode?: string;
}

export const validateAndCalculateDiscount = async (
  code: string,
  cartItems: CartItem[],
  cartTotal: number
): Promise<ValidationResult> => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    return { success: false, message: 'Cupón no encontrado.' };
  }

  if (coupon.expirationDate < new Date()) {
    return { success: false, message: 'Cupón expirado.' };
  }

  if (coupon.usedCount >= coupon.maxUses) {
    return { success: false, message: 'Cupón ha alcanzado su límite de usos.' };
  }

  if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
    return { success: false, message: `Compra mínima de $U ${coupon.minPurchaseAmount} requerida.` };
  }

  let discountAmount = 0;
  let applicableItemsTotal = 0;

  if (coupon.applicableTo === 'all') {
    applicableItemsTotal = cartTotal;
  } else if (coupon.applicableTo === 'products' && coupon.applicableItems && coupon.applicableItems.length > 0) {
    applicableItemsTotal = cartItems.reduce((sum: number, item: any) => {
      if (coupon.applicableItems?.includes(item.productId)) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);
  } else if (coupon.applicableTo === 'categories' && coupon.applicableItems && coupon.applicableItems.length > 0) {
    applicableItemsTotal = cartItems.reduce((sum: number, item: any) => {
      if (coupon.applicableItems?.includes(item.category)) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);
  }

  if (applicableItemsTotal === 0 && coupon.applicableTo !== 'all') {
    return { success: false, message: 'Este cupón no aplica a los productos en tu carrito.' };
  }

  if (coupon.discountType === 'percentage') {
    discountAmount = applicableItemsTotal * (coupon.value / 100);
  } else if (coupon.discountType === 'fixed') {
    discountAmount = coupon.value;
  }

  discountAmount = Math.min(discountAmount, applicableItemsTotal);

  const newCartTotal = cartTotal - discountAmount;

  return {
    success: true,
    message: 'Cupón aplicado con éxito!',
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    newCartTotal: parseFloat(newCartTotal.toFixed(2)),
    couponCode: coupon.code,
  };
};