import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';

// Estilos para el PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 20,
    },
    logoSection: {
        width: '40%',
    },
    logo: {
        width: 60,
        marginBottom: 10,
    },
    companyInfo: {
        fontSize: 9,
        lineHeight: 1.4,
        color: '#555',
    },
    titleSection: {
        width: '40%',
        textAlign: 'right',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#E84393',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    quoteNumber: {
        fontSize: 12,
        color: '#666',
        marginBottom: 20,
    },
    clientSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        backgroundColor: '#f9fafb',
        padding: 15,
        borderRadius: 4,
    },
    clientCol: {
        width: '48%',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#E84393',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    text: {
        marginBottom: 4,
    },
    table: {
        width: '100%',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#E84393',
        color: '#fff',
        padding: 8,
        fontWeight: 'bold',
        fontSize: 9,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        padding: 8,
        fontSize: 9,
    },
    colImage: { width: '12%' },
    colProduct: { width: '33%' },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '20%', textAlign: 'right' },
    colTotal: { width: '25%', textAlign: 'right' },
    productImage: {
        width: 50,
        height: 50,
        objectFit: 'cover',
        borderRadius: 4,
    },
    productName: {
        fontWeight: 'bold',
        marginBottom: 2,
    },
    productLink: {
        color: '#0066CC', // Azul link
        textDecoration: 'underline',
        fontSize: 8,
    },
    description: {
        fontSize: 8,
        color: '#666',
        marginTop: 2,
    },
    totalsSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    totalsTable: {
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    finalTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderTopWidth: 2,
        borderTopColor: '#E84393',
        marginTop: 4,
    },
    totalLabel: {
        fontWeight: 'bold',
    },
    totalValue: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    termsSection: {
        marginTop: 40,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#999',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
    },
});

interface QuoteTemplateProps {
    quote: any;
    logoUrl?: string;
}

const QuoteTemplate: React.FC<QuoteTemplateProps> = ({ quote, logoUrl }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-UY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(amount);
    };

    // Normalizar URLs de imágenes para que sean absolutas
    const normalizeImageUrl = (url: string | undefined): string | null => {
        if (!url) return null;

        // Si ya es absoluta
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        // Si es relativa, convertir a absoluta
        if (url.startsWith('/')) {
            // En desarrollo, intentar usar localhost si la imagen es local
            const baseUrl = process.env.NODE_ENV === 'development'
                ? 'http://localhost:3000'
                : 'https://www.papeleriapersonalizada.uy';
            const finalUrl = `${baseUrl}${url}`;
            console.log(`[PDF] Converting relative URL: ${url} -> ${finalUrl}`);
            return finalUrl;
        }

        console.log(`[PDF] Using absolute URL: ${url}`);
        return url; // Retornar tal cual si no coincide con lo anterior (ej. blob, data uri)
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <Image
                            src={logoUrl || "/logo.webp"}
                            style={styles.logo}
                        />
                        <View style={styles.companyInfo}>
                            <Text style={{ fontWeight: 'bold' }}>Papelería Personalizada Kamaluso</Text>
                            <Text>Razón Social: Katherine Silva</Text>
                            <Text>RUT: 150754350013</Text>
                            <Text>Email: kamalusosanjose@gmail.com</Text>
                            <Text>San José de Mayo, Uruguay</Text>
                        </View>
                    </View>

                    <View style={styles.titleSection}>
                        <Text style={styles.title}>PRESUPUESTO</Text>
                        <Text style={styles.quoteNumber}>N° {quote.quoteNumber}</Text>
                        <Text style={styles.text}>Fecha: {formatDate(quote.createdAt)}</Text>
                        <Text style={styles.text}>Válido hasta: {formatDate(quote.validUntil)}</Text>
                    </View>
                </View>

                {/* Client Info */}
                <View style={styles.clientSection}>
                    <View style={{ width: '100%' }}>
                        <Text style={styles.sectionTitle}>Cliente:</Text>
                        <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{quote.customer.name}</Text>
                        {quote.customer.company && <Text style={styles.text}>{quote.customer.company}</Text>}
                        <Text style={styles.text}>{quote.customer.email}</Text>
                        {quote.customer.phone && <Text style={styles.text}>{quote.customer.phone}</Text>}
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colImage}></Text>
                        <Text style={styles.colProduct}>Producto / Descripción</Text>
                        <Text style={styles.colQty}>Cant.</Text>
                        <Text style={styles.colPrice}>Precio Unit.</Text>
                        <Text style={styles.colTotal}>Total</Text>
                    </View>

                    {quote.items.map((item: any, index: number) => {
                        const imageUrl = normalizeImageUrl(item.imageUrl);

                        return (
                            <View key={index} style={styles.tableRow}>
                                <View style={styles.colImage}>
                                    {imageUrl ? (
                                        // eslint-disable-next-line jsx-a11y/alt-text
                                        <Image src={imageUrl} style={styles.productImage} />
                                    ) : (
                                        <View style={{
                                            width: 50,
                                            height: 50,
                                            backgroundColor: '#f0f0f0',
                                            borderRadius: 4,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Text style={{ fontSize: 8, color: '#999' }}>Sin imagen</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.colProduct}>
                                    <Text style={styles.productName}>
                                        {item.productLink ? (
                                            <Link src={item.productLink} style={styles.productLink}>
                                                {item.productName} 🔗
                                            </Link>
                                        ) : (
                                            item.productName
                                        )}
                                    </Text>
                                    <Text style={styles.description}>{item.description}</Text>
                                    {item.customizations && item.customizations.length > 0 && (
                                        <Text style={{ fontSize: 8, color: '#888', marginTop: 2 }}>
                                            • {item.customizations.join(', ')}
                                        </Text>
                                    )}
                                </View>
                                <Text style={styles.colQty}>{item.quantity}</Text>
                                <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
                                <Text style={styles.colTotal}>{formatCurrency(item.subtotal)}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalsTable}>
                        <View style={styles.totalRow}>
                            <Text>Subtotal:</Text>
                            <Text>{formatCurrency(quote.subtotal)}</Text>
                        </View>
                        {quote.discount > 0 && (
                            <View style={styles.totalRow}>
                                <Text>Descuento {quote.discountDescription ? `(${quote.discountDescription})` : ''}:</Text>
                                <Text>- {formatCurrency(quote.discount)}</Text>
                            </View>
                        )}
                        {quote.tax > 0 && (
                            <View style={styles.totalRow}>
                                <Text>IVA:</Text>
                                <Text>{formatCurrency(quote.tax)}</Text>
                            </View>
                        )}
                        {quote.shipping > 0 && (
                            <View style={styles.totalRow}>
                                <Text>Envío:</Text>
                                <Text>{formatCurrency(quote.shipping)}</Text>
                            </View>
                        )}
                        <View style={styles.finalTotalRow}>
                            <Text style={styles.totalLabel}>TOTAL:</Text>
                            <Text style={styles.totalValue}>{formatCurrency(quote.total)}</Text>
                        </View>
                    </View>
                </View>

                {/* Terms & Notes */}
                <View style={styles.termsSection}>
                    {quote.notes && (
                        <View style={{ marginBottom: 15 }}>
                            <Text style={styles.sectionTitle}>Notas:</Text>
                            <Text style={styles.text}>{quote.notes}</Text>
                        </View>
                    )}

                    <View>
                        <Text style={styles.sectionTitle}>Términos y Condiciones:</Text>
                        <Text style={styles.text}>1. Este presupuesto es válido por 15 días a partir de la fecha de emisión.</Text>
                        <Text style={styles.text}>2. Para confirmar el pedido se requiere una seña del 50%.</Text>
                        <Text style={styles.text}>3. Los tiempos de entrega comienzan a correr una vez aprobado el diseño final.</Text>
                        {quote.terms && <Text style={styles.text}>{quote.terms}</Text>}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Gracias por confiar en Kamaluso - Papelería Personalizada</Text>
                    <Text>www.papeleriapersonalizada.uy</Text>
                </View>
            </Page>
        </Document>
    );
};

export default QuoteTemplate;
