import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductCard, { Product } from './ProductCard';

// Mock de componentes de Next.js
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt} {...rest} />;
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

// Mock de componentes hijos
jest.mock('./StarRating', () => ({
  __esModule: true,
  default: ({ rating }: { rating: number }) => (
    <div data-testid="star-rating">{`Rating: ${rating}`}</div>
  ),
}));

const mockProduct: Product = {
  _id: '12345',
  nombre: 'Agenda Personalizada 2025',
  precio: 1500,
  categoria: 'agendas',
  slug: 'agenda-personalizada-2025',
  imagen: 'https://example.com/imagen.webp',
  alt: 'Una agenda personalizada de color azul',
};

describe('Componente: ProductCard', () => {
  it('debería renderizar la información del producto correctamente', () => {
    render(<ProductCard product={mockProduct} />);

    // Verificar si se muestran el nombre y el precio
    expect(screen.getByText('Agenda Personalizada 2025')).toBeInTheDocument();
    expect(screen.getByText(/\$U 1500/)).toBeInTheDocument();

    // Verificar si la imagen se renderiza con el texto alternativo correcto
    const image = screen.getByAltText('Una agenda personalizada de color azul');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/imagen.webp');
  });

  it('debería tener los enlaces correctos a la página de detalle del producto', () => {
    render(<ProductCard product={mockProduct} />);
    const expectedUrl = '/productos/detail/test-product';

    // El componente tiene 3 enlaces que apuntan a la misma URL
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(3);
    links.forEach(link => {
        expect(link).toHaveAttribute('href', expectedUrl);
    });
  });

  it('debería mostrar la calificación de estrellas si hay reseñas', () => {
    const productWithReviews = {
      ...mockProduct,
      averageRating: 4.5,
      numReviews: 15,
    };
    render(<ProductCard product={productWithReviews} />);

    expect(screen.getByTestId('star-rating')).toBeInTheDocument();
    expect(screen.getByTestId('star-rating')).toHaveTextContent('Rating: 4.5');
    expect(screen.getByText('(15)')).toBeInTheDocument();
  });

  it('no debería mostrar la calificación de estrellas si no hay reseñas', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.queryByTestId('star-rating')).not.toBeInTheDocument();
  });

  it('debería mostrar el prefijo "Desde" para productos soloDestacado', () => {
    const soloDestacadoProduct = {
      ...mockProduct,
      soloDestacado: true,
    };
    render(<ProductCard product={soloDestacadoProduct} />);

    expect(screen.getByText(/Desde \$U 1500/)).toBeInTheDocument();
  });
});