"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndCalculateDiscount = void 0;
const Coupon_1 = __importDefault(require("@/models/Coupon"));
const validateAndCalculateDiscount = async (code, cartItems, cartTotal) => {
    const coupon = await Coupon_1.default.findOne({ code: code.toUpperCase() });
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
        return {
            success: false,
            message: `Compra mínima de $U ${coupon.minPurchaseAmount} requerida.`,
        };
    }
    let discountAmount = 0;
    let applicableItemsTotal = 0;
    if (coupon.applicableTo === 'all') {
        applicableItemsTotal = cartTotal;
    }
    else if (coupon.applicableTo === 'products' &&
        coupon.applicableItems &&
        coupon.applicableItems.length > 0) {
        applicableItemsTotal = cartItems.reduce((sum, item) => {
            var _a;
            if ((_a = coupon.applicableItems) === null || _a === void 0 ? void 0 : _a.includes(item.productId)) {
                return sum + item.price * item.quantity;
            }
            return sum;
        }, 0);
    }
    else if (coupon.applicableTo === 'categories' &&
        coupon.applicableItems &&
        coupon.applicableItems.length > 0) {
        applicableItemsTotal = cartItems.reduce((sum, item) => {
            var _a;
            if ((_a = coupon.applicableItems) === null || _a === void 0 ? void 0 : _a.includes(item.category)) {
                return sum + item.price * item.quantity;
            }
            return sum;
        }, 0);
    }
    if (applicableItemsTotal === 0 && coupon.applicableTo !== 'all') {
        return {
            success: false,
            message: 'Este cupón no aplica a los productos en tu carrito.',
        };
    }
    if (coupon.discountType === 'percentage') {
        discountAmount = applicableItemsTotal * (coupon.value / 100);
    }
    else if (coupon.discountType === 'fixed') {
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
exports.validateAndCalculateDiscount = validateAndCalculateDiscount;
