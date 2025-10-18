import { createMocks } from 'node-mocks-http';
import handler from './crear';
import connectDB from '@/lib/mongoose';
import Coupon from '@/models/Coupon';

// Mock de dependencias
jest.mock('@/lib/mongoose');
jest.mock('@/models/Coupon');

// Afirmación de tipo para la función mockeada
const mockedConnectDB = connectDB as jest.Mock;

describe('Endpoint de API: /api/coupons/crear', () => {
  beforeEach(() => {
    // Limpiar todas las instancias y llamadas al constructor y a todos los métodos:
    (Coupon as any).mockClear();
    mockedConnectDB.mockClear();
  });

  it('debería crear un nuevo cupón con una petición POST', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        code: 'TEST20',
        discountType: 'percentage',
        value: 20,
        expirationDate: '2099-12-31',
        maxUses: 100,
        applicableTo: 'all',
      },
    });

    // Mock del método save para la nueva instancia de Coupon
    const saveMock = jest.fn().mockResolvedValue(true);
    (Coupon as any).mockImplementation(() => ({
      save: saveMock,
    }));

    await handler(req, res);

    expect(mockedConnectDB).toHaveBeenCalledTimes(1);
    expect(res._getStatusCode()).toBe(201);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.message).toBe('Cupón creado con éxito');
    expect(saveMock).toHaveBeenCalledTimes(1);
  });

  it('debería devolver 405 si el método no es POST', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders()).toHaveProperty('allow', ['POST']);
  });

  it('debería devolver 400 si el código del cupón ya existe', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        code: 'DUPLICATE',
        discountType: 'fixed',
        value: 10,
      },
    });

    const error = { code: 11000 }; // Código de error de clave duplicada de MongoDB
    const saveMock = jest.fn().mockRejectedValue(error);
    (Coupon as any).mockImplementation(() => ({
      save: saveMock,
    }));

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'El código de cupón ya existe.' });
  });

  it('debería devolver 500 para un error genérico del servidor', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        code: 'FAIL',
        discountType: 'percentage',
        value: 15,
      },
    });

    const error = new Error('Database connection failed');
    const saveMock = jest.fn().mockRejectedValue(error);
    (Coupon as any).mockImplementation(() => ({
      save: saveMock,
    }));

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({
      message: 'Error al crear el cupón',
      error: 'Database connection failed',
    });
  });
});