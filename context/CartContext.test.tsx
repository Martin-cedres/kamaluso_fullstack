import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useCart, CartProvider, getCartItemId, CartItem } from './CartContext';

// Mock de localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Un componente de prueba simple que usa el hook y muestra su estado
const TestComponent = () => {
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount } = useCart();
  const product1 = { _id: 'prod1', nombre: 'Product 1', precio: 100 };
  const product2 = { _id: 'prod1', nombre: 'Product 1', precio: 100, finish: 'Matte' };

  return (
    <div>
      <div data-testid="cart-count">{cartCount}</div>
      <div data-testid="cart-items">{JSON.stringify(cartItems)}</div>
      <button onClick={() => addToCart(product1)}>Add Product 1</button>
      <button onClick={() => addToCart(product2)}>Add Product 1 (Matte)</button>
      <button onClick={() => removeFromCart(getCartItemId(product1))}>Remove Product 1</button>
      <button onClick={() => updateQuantity(getCartItemId(product1), 5)}>Update Qty</button>
      <button onClick={() => updateQuantity(getCartItemId(product1), 0)}>Update Qty to 0</button>
      <button onClick={() => clearCart()}>Clear Cart</button>
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <CartProvider>
      <TestComponent />
    </CartProvider>
  );
};

describe('Contexto del Carrito', () => {
  beforeEach(() => {
    // Limpiar localStorage y el estado del componente antes de cada prueba
    localStorageMock.clear();
  });

  describe('Función de Ayuda: getCartItemId', () => {
    it('debería devolver solo el id si no se proporciona un acabado', () => {
        expect(getCartItemId({_id: '123'})).toBe('123');
    });
    it('debería devolver un id compuesto si se proporciona un acabado', () => {
        expect(getCartItemId({_id: '123', finish: 'Glossy'})).toBe('123-Glossy');
    });
  });

  it('debería tener un estado inicial correcto', () => {
    renderWithProvider();
    expect(screen.getByTestId('cart-count').textContent).toBe('0');
    expect(screen.getByTestId('cart-items').textContent).toBe('[]');
  });

  it('debería añadir un nuevo item al carrito', () => {
    renderWithProvider();
    act(() => {
      screen.getByText('Add Product 1').click();
    });
    expect(screen.getByTestId('cart-count').textContent).toBe('1');
    expect(JSON.parse(screen.getByTestId('cart-items').textContent!)).toEqual([
      { _id: 'prod1', nombre: 'Product 1', precio: 100, quantity: 1 },
    ]);
  });

  it('debería incrementar la cantidad de un item existente', () => {
    renderWithProvider();
    act(() => {
      screen.getByText('Add Product 1').click();
    });
    act(() => {
      screen.getByText('Add Product 1').click();
    });
    expect(screen.getByTestId('cart-count').textContent).toBe('2');
    expect(JSON.parse(screen.getByTestId('cart-items').textContent!)[0].quantity).toBe(2);
  });

  it('debería añadir un nuevo item para el mismo producto con un acabado diferente', () => {
    renderWithProvider();
    act(() => { screen.getByText('Add Product 1').click(); });
    act(() => { screen.getByText('Add Product 1 (Matte)').click(); });
    
    expect(screen.getByTestId('cart-count').textContent).toBe('2');
    const items = JSON.parse(screen.getByTestId('cart-items').textContent!);
    expect(items.length).toBe(2);
    expect(items[0].finish).toBeUndefined();
    expect(items[1].finish).toBe('Matte');
  });

  it('debería actualizar la cantidad de un item', () => {
    renderWithProvider();
    act(() => { screen.getByText('Add Product 1').click(); });
    act(() => { screen.getByText('Update Qty').click(); });

    expect(screen.getByTestId('cart-count').textContent).toBe('5');
    expect(JSON.parse(screen.getByTestId('cart-items').textContent!)[0].quantity).toBe(5);
  });

  it('debería eliminar un item cuando la cantidad se actualiza a 0', () => {
    renderWithProvider();
    act(() => { screen.getByText('Add Product 1').click(); });
    act(() => { screen.getByText('Update Qty to 0').click(); });

    expect(screen.getByTestId('cart-count').textContent).toBe('0');
    expect(screen.getByTestId('cart-items').textContent).toBe('[]');
  });

  it('debería eliminar un item del carrito', () => {
    renderWithProvider();
    act(() => { screen.getByText('Add Product 1').click(); });
    act(() => { screen.getByText('Remove Product 1').click(); });

    expect(screen.getByTestId('cart-count').textContent).toBe('0');
    expect(screen.getByTestId('cart-items').textContent).toBe('[]');
  });

  it('debería limpiar el carrito', () => {
    renderWithProvider();
    act(() => { screen.getByText('Add Product 1').click(); });
    act(() => { screen.getByText('Add Product 1 (Matte)').click(); });
    act(() => { screen.getByText('Clear Cart').click(); });

    expect(screen.getByTestId('cart-count').textContent).toBe('0');
    expect(screen.getByTestId('cart-items').textContent).toBe('[]');
  });
});