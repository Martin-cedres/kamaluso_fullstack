---
description: Especialista en testing de Next.js con Jest y React Testing Library
---

# Skill: Testing Strategy Guide

## Propósito
Guiar al agente en la implementación de tests para el proyecto Kamaluso, siguiendo mejores prácticas para Next.js, Jest y React Testing Library.

## Stack de Testing

**Framework**: Jest (v29.7.0)
**UI Testing**: React Testing Library (v16.3.0)
**Mocking**: jest-environment-jsdom
**Configuración**: `jest.config.js` y `jest.setup.js`

## Estructura de Tests

```
kamaluso_fullstack/
├── __tests__/
│   ├── components/
│   │   └── Product.test.tsx
│   ├── pages/
│   │   └── api/
│   │       └── products.test.ts
│   └── utils/
│       └── price-calculator.test.ts
├── jest.config.js
└── jest.setup.js
```

## Tests de Componentes

### Template Básico
```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    _id: '123',
    name: 'Agenda 2026',
    slug: 'agenda-2026',
    basePrice: 1500,
    images: [{ url: '/test.jpg', alt: 'Test' }]
  };

  it('renderiza el nombre del producto', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Agenda 2026')).toBeInTheDocument();
  });

  it('muestra el precio formateado', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('$1.500')).toBeInTheDocument();
  });
});
```

### Testing con User Interactions
```typescript
import userEvent from '@testing-library/user-event';

it('agrega producto al carrito al hacer click', async () => {
  const user = userEvent.setup();
  const addToCart = jest.fn();
  
  render(<ProductCard product={mockProduct} onAddToCart={addToCart} />);
  
  const button = screen.getByRole('button', { name: /agregar/i });
  await user.click(button);
  
  expect(addToCart).toHaveBeenCalledWith(mockProduct);
});
```

## Tests de API Routes

### Template para Next.js API
```typescript
// __tests__/pages/api/products.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/products';
import Product from '@/models/Product';

jest.mock('@/models/Product');
jest.mock('@/lib/mongoose', () => ({
  connectDB: jest.fn()
}));

describe('/api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET devuelve lista de productos', async () => {
    const mockProducts = [
      { name: 'Producto 1', basePrice: 100 },
      { name: 'Producto 2', basePrice: 200 }
    ];
    
    (Product.find as jest.Mock).mockResolvedValue(mockProducts);
    
    const { req, res } = createMocks({
      method: 'GET'
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(mockProducts);
  });

  it('POST crea nuevo producto si es admin', async () => {
    const newProduct = { name: 'Nuevo', basePrice: 300 };
    
    (Product.create as jest.Mock).mockResolvedValue(newProduct);
    
    const { req, res } = createMocks({
      method: 'POST',
      body: newProduct
    });
    
    // Mock de sesión admin
    req.headers = { cookie: 'session=admin-token' };
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(201);
    expect(Product.create).toHaveBeenCalledWith(newProduct);
  });
});
```

## Mocking de NextAuth

```typescript
import { getToken } from 'next-auth/jwt';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn()
}));

describe('Protected API', () => {
  it('rechaza request sin autenticación', async () => {
    (getToken as jest.Mock).mockResolvedValue(null);
    
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(401);
  });

  it('permite request de admin', async () => {
    (getToken as jest.Mock).mockResolvedValue({
      email: 'admin@kamaluso.com',
      role: 'admin'
    });
    
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
  });
});
```

## Testing de Hooks Personalizados

```typescript
// __tests__/hooks/useCart.test.ts
import { renderHook, act } from '@testing-library/react';
import useCart from '@/hooks/useCart';

describe('useCart', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicia con carrito vacío', () => {
    const { result } = renderHook(() => useCart());
    expect(result.current.items).toEqual([]);
  });

  it('agrega item al carrito', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem({
        productId: '123',
        name: 'Producto',
        quantity: 1,
        totalPrice: 100
      });
    });
    
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe('Producto');
  });

  it('persiste en localStorage', () => {
    const { result } = renderHook(() => useCart());
    
    act(() => {
      result.current.addItem({ productId: '123', name: 'Test', quantity: 1, totalPrice: 100 });
    });
    
    const stored = JSON.parse(localStorage.getItem('cart') || '[]');
    expect(stored).toHaveLength(1);
  });
});
```

## Mocking de Servicios Externos

### Mercado Pago
```typescript
jest.mock('mercadopago', () => ({
  MercadoPagoConfig: jest.fn(),
  Preference: jest.fn(() => ({
    create: jest.fn().mockResolvedValue({
      init_point: 'https://mercadopago.com/checkout/123'
    })
  }))
}));
```

### AWS S3
```typescript
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(),
  PutObjectCommand: jest.fn(),
  send: jest.fn().mockResolvedValue({ ETag: '"abc123"' })
}));
```

### Google Gemini
```typescript
jest.mock('@/lib/gemini-agent', () => ({
  generateWithFallback: jest.fn().mockResolvedValue(JSON.stringify({
    seoTitle: 'Título generado',
    metaDescription: 'Descripción generada'
  }))
}));
```

## Snapshot Testing

Útil para componentes visuales que no deben cambiar:

```typescript
it('matchea snapshot', () => {
  const { container } = render(<ProductCard product={mockProduct} />);
  expect(container).toMatchSnapshot();
});

// Actualizar snapshots:
// npm test -- -u
```

## Testing de Funciones de Utilidad

```typescript
// __tests__/utils/price-calculator.test.ts
import { calculateDiscount, formatPrice } from '@/lib/utils';

describe('calculateDiscount', () => {
  it('calcula descuento porcentual correctamente', () => {
    expect(calculateDiscount(1000, { type: 'percentage', value: 15 })).toBe(150);
  });

  it('calcula descuento fijo correctamente', () => {
    expect(calculateDiscount(1000, { type: 'fixed', value: 200 })).toBe(200);
  });

  it('no aplica descuento si no cumple mínimo', () => {
    expect(calculateDiscount(500, { 
      type: 'percentage', 
      value: 15, 
      minPurchase: 1000 
    })).toBe(0);
  });
});

describe('formatPrice', () => {
  it('formatea precio uruguayo', () => {
    expect(formatPrice(1500)).toBe('$1.500');
    expect(formatPrice(10000)).toBe('$10.000');
  });
});
```

## Coverage

### Ejecutar con coverage:
```bash
npm test -- --coverage
```

### Configurar mínimos (jest.config.js):
```javascript
module.exports = {
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

## Mejores Prácticas

### 1. Arrange-Act-Assert (AAA)
```typescript
it('ejemplo de patrón AAA', () => {
  // Arrange: Preparar datos
  const product = { name: 'Test', basePrice: 100 };
  
  // Act: Ejecutar acción
  const result = calculatePrice(product, { quantity: 2 });
  
  // Assert: Verificar resultado
  expect(result).toBe(200);
});
```

### 2. Nombres Descriptivos
```typescript
// ❌ MAL
it('test 1', () => { ... });

// ✅ BIEN
it('incrementa la cantidad cuando se hace click en el botón +', () => { ... });
```

### 3. Un Assert por Test (cuando sea posible)
```typescript
// ❌ MAL (test hace muchas cosas)
it('carrito funciona', () => {
  expect(cart.items).toHaveLength(0);
  cart.addItem(item);
  expect(cart.items).toHaveLength(1);
  expect(cart.total).toBe(100);
  cart.removeItem(item.id);
  expect(cart.items).toHaveLength(0);
});

// ✅ BIEN (cada test verifica una cosa)
it('inicia vacío', () => {
  expect(cart.items).toHaveLength(0);
});

it('agrega items', () => {
  cart.addItem(item);
  expect(cart.items).toHaveLength(1);
});
```

### 4. Limpiar después de cada test
```typescript
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});
```

## Debugging Tests

### Modo watch:
```bash
npm test -- --watch
```

### Ver output detallado:
```bash
npm test -- --verbose
```

### Debugger en VSCode:
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal"
}
```

## Recursos Relacionados
- [Jest Config](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/jest.config.js)
- [Jest Setup](file:///c:/Users/LENOVO/Desktop/kamaluso_fullstack/jest.setup.js)
- [Testing Library Docs](https://testing-library.com/react)

## Checklist para Nuevos Tests

- [ ] Test tiene nombre descriptivo
- [ ] Usa patrón AAA (Arrange-Act-Assert)
- [ ] Limpia mocks/state después de ejecutar
- [ ] No depende de orden de ejecución
- [ ] Prueba casos edge (null, undefined, arrays vacíos)
- [ ] Servicios externos están mockeados
- [ ] No hace llamadas reales a APIs externas
- [ ] Corre rápido (< 100ms por test)
