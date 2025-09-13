import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongoose';
import Coupon from '@/models/Coupon';
import Product from '@/models/Product'; // Corrected import

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB(); // Corrected DB connection

  if (req.method === 'POST') {
    try {
      const { code, cartItems, cartTotal } = req.body; // cartItems should be an array of { productId: string, quantity: number, price: number, category: string }

      if (!code || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0 || typeof cartTotal !== 'number') {
        return res.status(400).json({ message: 'Datos de entrada inválidos.' });
      }

      const coupon = await Coupon.findOne({ code: code.toUpperCase() });

      if (!coupon) {
        return res.status(404).json({ message: 'Cupón no encontrado.' });
      }

      // 1. Check expiration date
      if (coupon.expirationDate < new Date()) {
        return res.status(400).json({ message: 'Cupón expirado.' });
      }

      // 2. Check max uses
      if (coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ message: 'Cupón ha alcanzado su límite de usos.' });
      }

      // 3. Check minimum purchase amount
      if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
        return res.status(400).json({ message: `Compra mínima de $U ${coupon.minPurchaseAmount} requerida.` });
      }

      let discountAmount = 0;
      let applicableItemsTotal = 0; // Total of items that the coupon applies to

      if (coupon.applicableTo === 'all') {
        applicableItemsTotal = cartTotal;
      } else if (coupon.applicableTo === 'products' && coupon.applicableItems && coupon.applicableItems.length > 0) {
        // Sum prices of applicable products in cart
        applicableItemsTotal = cartItems.reduce((sum: number, item: any) => {
          if (coupon.applicableItems?.includes(item.productId)) {
            return sum + (item.price * item.quantity);
          }
          return sum;
        }, 0);
      } else if (coupon.applicableTo === 'categories' && coupon.applicableItems && coupon.applicableItems.length > 0) {
        // Sum prices of applicable categories in cart
        // This assumes cartItems has a 'category' field. If not, you'd need to fetch product details.
        applicableItemsTotal = cartItems.reduce((sum: number, item: any) => {
          if (coupon.applicableItems?.includes(item.category)) {
            return sum + (item.price * item.quantity);
          }
          return sum;
        }, 0);
      }

      if (applicableItemsTotal === 0 && coupon.applicableTo !== 'all') {
        return res.status(400).json({ message: 'Este cupón no aplica a los productos en tu carrito.' });
      }

      // Calculate discount
      if (coupon.discountType === 'percentage') {
        discountAmount = applicableItemsTotal * (coupon.value / 100);
      } else if (coupon.discountType === 'fixed') {
        discountAmount = coupon.value;
      }

      // Ensure discount doesn't exceed the applicable items total
      discountAmount = Math.min(discountAmount, applicableItemsTotal);

      const newCartTotal = cartTotal - discountAmount;

      res.status(200).json({
        message: 'Cupón aplicado con éxito!',
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        newCartTotal: parseFloat(newCartTotal.toFixed(2)),
        couponCode: coupon.code,
      });

    } catch (error: any) {
      console.error('Error al aplicar cupón:', error);
      res.status(500).json({ message: 'Error interno al aplicar el cupón', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
