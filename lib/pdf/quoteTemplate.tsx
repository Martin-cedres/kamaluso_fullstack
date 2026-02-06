import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link } from '@react-pdf/renderer';

// Estilos para el PDF
// Estilos para el PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#1e293b',
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#1e293b',
        paddingBottom: 20,
    },
    logoSection: {
        width: '50%',
    },
    logo: {
        width: 80,
        marginBottom: 8,
    },
    companyInfo: {
        fontSize: 9,
        lineHeight: 1.4,
        color: '#475569',
    },
    titleSection: {
        width: '40%',
        textAlign: 'right',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
        letterSpacing: 1,
    },
    quoteNumber: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
        marginBottom: 10,
    },
    dateInfo: {
        fontSize: 9,
        color: '#475569',
        marginBottom: 2,
    },
    clientSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        backgroundColor: '#f8fafc',
        padding: 15,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    text: {
        marginBottom: 3,
        lineHeight: 1.4,
    },
    table: {
        width: '100%',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1e293b',
        color: '#fff',
        padding: 8,
        fontWeight: 'bold',
        fontSize: 9,
        borderRadius: 2,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 8,
        paddingHorizontal: 4,
        fontSize: 9,
        alignItems: 'center',
    },
    colImage: { width: '12%' },
    colProduct: { width: '38%' },
    colQty: { width: '10%', textAlign: 'center' },
    colPrice: { width: '18%', textAlign: 'right' },
    colTotal: { width: '22%', textAlign: 'right' },
    productImage: {
        width: 45,
        height: 45,
        objectFit: 'cover',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    productName: {
        fontWeight: 'bold',
        fontSize: 10,
        marginBottom: 2,
        color: '#1e293b',
    },
    productLink: {
        color: '#2563eb',
        textDecoration: 'underline',
        fontSize: 8,
    },
    description: {
        fontSize: 8.5,
        color: '#64748b',
        marginTop: 1,
    },
    totalsSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        marginBottom: 30,
    },
    totalsTable: {
        width: '35%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    finalTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderTopWidth: 2,
        borderTopColor: '#1e293b',
        marginTop: 6,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    totalLabel: {
        fontWeight: 'bold',
        fontSize: 11,
    },
    totalValue: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#1e293b',
    },
    persuasionSection: {
        marginTop: 10,
        padding: 15,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderLeftWidth: 4,
        borderLeftColor: '#334155',
    },
    trustBox: {
        marginBottom: 12,
    },
    trustText: {
        fontSize: 9.5,
        fontStyle: 'italic',
        color: '#334155',
        lineHeight: 1.5,
    },
    nextStepsBox: {
        marginTop: 5,
    },
    nextStepsTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 4,
    },
    nextStepsText: {
        fontSize: 9,
        color: '#475569',
    },
    guaranteeBadge: {
        marginTop: 15,
        textAlign: 'center',
        padding: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderStyle: 'dashed',
        borderRadius: 4,
    },
    guaranteeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1e293b',
        textTransform: 'uppercase',
    },
    termsSection: {
        marginTop: 25,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    footerStatus: {
        position: 'absolute',
        bottom: 70,
        left: 40,
        right: 40,
        textAlign: 'center',
    },
    validityBadge: {
        backgroundColor: '#fef2f2',
        color: '#991b1b',
        fontSize: 8,
        padding: 4,
        borderRadius: 4,
        fontWeight: 'bold',
        width: 'auto',
        alignSelf: 'flex-end',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8.5,
        color: '#94a3b8',
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
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
                            <Text style={{ fontWeight: 'bold', color: '#1e293b', fontSize: 10, marginBottom: 2 }}>Papelería Personalizada Kamaluso</Text>
                            <Text>RUT: 150754350013</Text>
                            <Text>San José de Mayo, Uruguay</Text>
                            <Text>Email: kamalusosanjose@gmail.com</Text>
                            <Text>Web: www.papeleriapersonalizada.uy</Text>
                        </View>
                    </View>

                    <View style={styles.titleSection}>
                        <Text style={styles.title}>PRESUPUESTO</Text>
                        <Text style={styles.quoteNumber}>N° {quote.quoteNumber}</Text>
                        <View style={{ marginTop: 5 }}>
                            <Text style={styles.dateInfo}>Fecha de emisión: {formatDate(quote.createdAt)}</Text>
                            <Text style={[styles.dateInfo, { fontWeight: 'bold', color: '#991b1b' }]}> Válido hasta: {formatDate(quote.validUntil)}</Text>
                        </View>
                    </View>
                </View>

                {/* Client Info */}
                <View style={styles.clientSection}>
                    <View style={{ width: '60%' }}>
                        <Text style={styles.sectionTitle}>Preparado para:</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 11, marginBottom: 2, color: '#1e293b' }}>{quote.customer.name}</Text>
                        {quote.customer.company && <Text style={[styles.text, { fontWeight: 'bold' }]}>{quote.customer.company}</Text>}
                        <Text style={styles.text}>{quote.customer.email}</Text>
                        {quote.customer.phone && <Text style={styles.text}>{quote.customer.phone}</Text>}
                    </View>
                    <View style={{ width: '35%', alignItems: 'flex-end' }}>
                        <View style={styles.validityBadge}>
                            <Text>OFERTA POR TIEMPO LIMITADO</Text>
                        </View>
                    </View>
                </View>

                {/* Intro Message (Optional check for notes that look like intro) */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={[styles.text, { fontSize: 10, fontStyle: 'italic', color: '#475569' }]}>
                        Propuesta personalizada para la provisión de papelería institucional y soluciones corporativas premium.
                    </Text>
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
                            <View key={index} style={styles.tableRow} wrap={false}>
                                <View style={styles.colImage}>
                                    {imageUrl ? (
                                        // eslint-disable-next-line jsx-a11y/alt-text
                                        <Image src={imageUrl} style={styles.productImage} />
                                    ) : (
                                        <View style={{
                                            width: 45,
                                            height: 45,
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 4,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderWidth: 1,
                                            borderColor: '#e2e8f0'
                                        }}>
                                            <Text style={{ fontSize: 7, color: '#94a3b8' }}>N/A</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.colProduct}>
                                    <Text style={styles.productName}>
                                        {item.productLink ? (
                                            <Link src={item.productLink} style={styles.productLink}>
                                                {item.productName}
                                            </Link>
                                        ) : (
                                            item.productName
                                        )}
                                    </Text>
                                    <Text style={styles.description}>{item.description}</Text>
                                    {item.customizations && item.customizations.length > 0 && (
                                        <Text style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>
                                            Personalización: {item.customizations.join(', ')}
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
                {!quote.hideTotal && (
                    <View style={styles.totalsSection} wrap={false}>
                        <View style={styles.totalsTable}>
                            <View style={styles.totalRow}>
                                <Text style={{ color: '#64748b' }}>Subtotal:</Text>
                                <Text>{formatCurrency(quote.subtotal)}</Text>
                            </View>
                            {quote.discount > 0 && (
                                <View style={styles.totalRow}>
                                    <Text style={{ color: '#059669' }}>
                                        Descuento {quote.discountType === 'percentage' ? `(${quote.discount}%)` : ''} {quote.discountDescription ? ` ${quote.discountDescription}` : ''}:
                                    </Text>
                                    <Text style={{ color: '#059669' }}>
                                        - {formatCurrency(quote.discountType === 'percentage' ? (quote.subtotal * quote.discount) / 100 : quote.discount)}
                                    </Text>
                                </View>
                            )}
                            {quote.tax > 0 && (
                                <View style={styles.totalRow}>
                                    <Text style={{ color: '#64748b' }}>IVA / Impuestos:</Text>
                                    <Text>{formatCurrency(quote.tax)}</Text>
                                </View>
                            )}
                            {quote.shipping > 0 && (
                                <View style={styles.totalRow}>
                                    <Text style={{ color: '#64748b' }}>Envío:</Text>
                                    <Text>{formatCurrency(quote.shipping)}</Text>
                                </View>
                            )}
                            <View style={styles.finalTotalRow}>
                                <Text style={styles.totalLabel}>TOTAL FINAL:</Text>
                                <Text style={styles.totalValue}>{formatCurrency(quote.total)}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* PERSUASION SECTION */}
                <View style={styles.persuasionSection} wrap={false}>
                    <View style={styles.trustBox}>
                        <Text style={styles.sectionTitle}>Nuestra Promesa de Calidad:</Text>
                        <Text style={styles.trustText}>
                            "Excelencia en cada detalle: Seleccionamos materiales de la más alta calidad para garantizar acabados de lujo y máxima durabilidad en cada uno de nuestros productos."
                        </Text>
                    </View>

                    <View style={styles.nextStepsBox}>
                        <Text style={styles.nextStepsTitle}>Próximos Pasos:</Text>
                        <Text style={styles.nextStepsText}>
                            Para confirmar su pedido e iniciar el proceso de producción, por favor contáctenos a través de nuestros canales oficiales para coordinar el pago de la seña (50%).
                        </Text>
                    </View>

                    <View style={styles.guaranteeBadge}>
                        <Text style={styles.guaranteeText}>✓ Satisfacción Garantizada en cada etapa del proceso</Text>
                    </View>
                </View>

                {/* Terms & Notes */}
                <View style={styles.termsSection} wrap={false}>
                    {quote.notes && (
                        <View style={{ marginBottom: 12 }}>
                            <Text style={[styles.sectionTitle, { fontSize: 9 }]}>Observaciones adicionales:</Text>
                            <Text style={[styles.text, { fontSize: 9, color: '#475569' }]}>{quote.notes}</Text>
                        </View>
                    )}

                    <View>
                        <Text style={[styles.sectionTitle, { fontSize: 9 }]}>Términos y Condiciones Generales:</Text>
                        <Text style={[styles.text, { fontSize: 8, color: '#64748b' }]}>1. Este presupuesto tiene una validez de 15 días corridos a partir de la fecha de emisión.</Text>
                        <Text style={[styles.text, { fontSize: 8, color: '#64748b' }]}>2. El inicio de la producción queda sujeto a la confirmación de la seña correspondiente.</Text>
                        <Text style={[styles.text, { fontSize: 8, color: '#64748b' }]}>3. Los plazos de entrega se acordarán puntualmente tras el pago de la seña y aprobación de diseños finales.</Text>
                        {quote.terms && <Text style={[styles.text, { fontSize: 8, color: '#64748b' }]}>{quote.terms}</Text>}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Gracias por elegir la distinción de Kamaluso - Papelería Personalizada</Text>
                    <Text>Su confianza es nuestro principal valor</Text>
                </View>
            </Page>
        </Document>
    );
};

export default QuoteTemplate;
