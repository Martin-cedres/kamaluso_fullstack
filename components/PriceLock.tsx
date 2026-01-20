import React from 'react';
import Head from 'next/head';

interface PriceLockProps {
    price: number;
    productName: string;
    productUrl: string;
    productImage?: string;
    productDescription?: string;
    hasAccess: boolean;
    onUnlockRequest: () => void;
    size?: 'sm' | 'md' | 'lg';
}

const PriceLock: React.FC<PriceLockProps> = ({
    price,
    productName,
    productUrl,
    productImage,
    productDescription,
    hasAccess,
    onUnlockRequest,
    size = 'md',
}) => {
    const siteUrl = 'https://www.papeleriapersonalizada.uy';

    // Schema.org con precio visible para Google
    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productName,
        image: productImage ? (productImage.startsWith('http') ? productImage : `${siteUrl}${productImage}`) : undefined,
        description: productDescription || `${productName} - Insumo para sublimación`,
        offers: {
            '@type': 'Offer',
            url: productUrl.startsWith('http') ? productUrl : `${siteUrl}${productUrl}`,
            priceCurrency: 'UYU',
            price: price,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            areaServed: {
                '@type': 'Country',
                name: 'Uruguay',
            },
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        },
        audience: {
            '@type': 'BusinessAudience',
            audienceType: 'Wholesaler',
        },
        brand: {
            '@type': 'Brand',
            name: 'Kamaluso',
        },
    };

    const sizeClasses = {
        sm: {
            container: 'text-sm',
            price: 'text-lg',
            button: 'text-xs px-2 py-1',
        },
        md: {
            container: 'text-base',
            price: 'text-xl',
            button: 'text-sm px-3 py-1.5',
        },
        lg: {
            container: 'text-lg',
            price: 'text-2xl',
            button: 'text-base px-4 py-2',
        },
    };

    const classes = sizeClasses[size];

    // Si tiene acceso, mostrar precio normal
    if (hasAccess) {
        return (
            <div className={`flex flex-col ${classes.container}`}>
                <p className={`${classes.price} font-bold text-naranja`}>
                    $U {price}
                </p>
            </div>
        );
    }

    // Si no tiene acceso, mostrar blur + botón
    return (
        <>
            {/* Schema movido a la página principal para optimización */}

            <div className={`flex flex-col gap-2 ${classes.container}`}>
                {/* Precio con blur */}
                <div className="relative inline-flex items-center gap-2">
                    <span className={`${classes.price} font-bold text-textoSecundario blur-md select-none`}>
                        $U {price}
                    </span>
                    <span className="text-xs text-naranja font-medium">Mayorista</span>
                </div>

                {/* Botón para desbloquear */}
                <button
                    onClick={onUnlockRequest}
                    className={`${classes.button} inline-flex items-center gap-1.5 bg-gradient-to-r from-naranja to-amarillo text-white font-semibold rounded-lg hover:shadow-kamalusoWarm transition-all duration-300 hover:-translate-y-0.5`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                    </svg>
                    Ver Precio
                </button>

                {/* Texto de ayuda */}
                <span className="text-xs text-textoSecundario">
                    Regístrate para acceder
                </span>
            </div>
        </>
    );
};

export default PriceLock;
