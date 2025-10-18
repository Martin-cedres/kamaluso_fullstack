import { validateAndCalculateDiscount } from './couponValidator';
import Coupon from '@/models/Coupon';

// Mock del modelo Coupon
jest.mock('@/models/Coupon');

const mockCartItems = [
  { productId: 'prod1', quantity: 1, price: 100, category: 'cat1' },
  { productId: 'prod2', quantity: 2, price: 50, category: 'cat2' },
];
const mockCartTotal = 200;

describe('Función: validateAndCalculateDiscount', () => {
  // Limpiar mocks antes de cada prueba
  beforeEach(() => {
    (Coupon.findOne as jest.Mock).mockClear();
  });

  it('debería aplicar un cupón de porcentaje válido', async () => {
    const mockCoupon = {
      code: 'TEST10',
      discountType: 'percentage',
      value: 10,
      expirationDate: new Date(Date.now() + 86400000), // Expira mañana
      maxUses: 100,
      usedCount: 10,
      minPurchaseAmount: 50,
      applicableTo: 'all',
      _doc: {}, // para compatibilidad con documentos de mongoose
    };
    (Coupon.findOne as jest.Mock).mockResolvedValue(mockCoupon);

    const result = await validateAndCalculateDiscount('TEST10', mockCartItems, mockCartTotal);

    expect(Coupon.findOne).toHaveBeenCalledWith({ code: 'TEST10' });
    expect(result.success).toBe(true);
    expect(result.message).toBe('Cupón aplicado con éxito!');
    expect(result.discountAmount).toBe(20); // 10% de 200
    expect(result.newCartTotal).toBe(180);
    expect(result.couponCode).toBe('TEST10');
  });

  it('debería aplicar un cupón de monto fijo válido', async () => {
    const mockCoupon = {
      code: 'FIXED50',
      discountType: 'fixed',
      value: 50,
      expirationDate: new Date(Date.now() + 86400000),
      maxUses: 100,
      usedCount: 10,
      minPurchaseAmount: 100,
      applicableTo: 'all',
      _doc: {},
    };
    (Coupon.findOne as jest.Mock).mockResolvedValue(mockCoupon);

    const result = await validateAndCalculateDiscount('FIXED50', mockCartItems, mockCartTotal);

    expect(result.success).toBe(true);
    expect(result.discountAmount).toBe(50);
    expect(result.newCartTotal).toBe(150);
  });

  it('debería devolver un error si el cupón no se encuentra', async () => {
    (Coupon.findOne as jest.Mock).mockResolvedValue(null);

    const result = await validateAndCalculateDiscount('NOTFOUND', mockCartItems, mockCartTotal);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Cupón no encontrado.');
  });

  it('debería devolver un error para un cupón expirado', async () => {
    const mockCoupon = {
      code: 'EXPIRED',
      expirationDate: new Date(Date.now() - 86400000), // Expiró ayer
      _doc: {},
    };
    (Coupon.findOne as jest.Mock).mockResolvedValue(mockCoupon);

    const result = await validateAndCalculateDiscount('EXPIRED', mockCartItems, mockCartTotal);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Cupón expirado.');
  });

  it('debería devolver un error si se ha alcanzado el límite de usos', async () => {
    const mockCoupon = {
      code: 'MAXEDOUT',
      expirationDate: new Date(Date.now() + 86400000),
      maxUses: 50,
      usedCount: 50,
      _doc: {},
    };
    (Coupon.findOne as jest.Mock).mockResolvedValue(mockCoupon);

    const result = await validateAndCalculateDiscount('MAXEDOUT', mockCartItems, mockCartTotal);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Cupón ha alcanzado su límite de usos.');
  });

  it('debería devolver un error si no se cumple el monto mínimo de compra', async () => {
    const mockCoupon = {
      code: 'MINPURCHASE',
      discountType: 'percentage',
      value: 10,
      expirationDate: new Date(Date.now() + 86400000),
      maxUses: 100,
      usedCount: 10,
      minPurchaseAmount: 250, // Más alto que el total del carrito
      _doc: {},
    };
    (Coupon.findOne as jest.Mock).mockResolvedValue(mockCoupon);

    const result = await validateAndCalculateDiscount('MINPURCHASE', mockCartItems, mockCartTotal);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Compra mínima de $U 250 requerida.');
  });

  it('debería aplicar correctamente un cupón a una categoría específica', async () => {
    const mockCoupon = {
        code: 'CATSPECIAL',
        discountType: 'percentage',
        value: 20,
        expirationDate: new Date(Date.now() + 86400000),
        maxUses: 100,
        usedCount: 10,
        minPurchaseAmount: 50,
        applicableTo: 'categories',
        applicableItems: ['cat1'], // Solo aplica al primer item del carrito
        _doc: {},
    };
    (Coupon.findOne as jest.Mock).mockResolvedValue(mockCoupon);

    const applicableItemsTotal = 100;
    const expectedDiscount = applicableItemsTotal * (mockCoupon.value / 100); // 20% de 100 = 20
    const expectedNewTotal = mockCartTotal - expectedDiscount; // 200 - 20 = 180

    const result = await validateAndCalculateDiscount('CATSPECIAL', mockCartItems, mockCartTotal);

    expect(result.success).toBe(true);
    expect(result.discountAmount).toBe(expectedDiscount);
    expect(result.newCartTotal).toBe(expectedNewTotal);
  });

  it('debería devolver un error si la categoría del cupón no coincide con ningún item', async () => {
    const mockCoupon = {
        code: 'WRONGCAT',
        discountType: 'percentage',
        value: 20,
        expirationDate: new Date(Date.now() + 86400000),
        maxUses: 100,
        usedCount: 10,
        minPurchaseAmount: 50,
        applicableTo: 'categories',
        applicableItems: ['cat99'], // Esta categoría no está en el carrito
        _doc: {},
    };
    (Coupon.findOne as jest.Mock).mockResolvedValue(mockCoupon);

    const result = await validateAndCalculateDiscount('WRONGCAT', mockCartItems, mockCartTotal);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Este cupón no aplica a los productos en tu carrito.');
  });
});
