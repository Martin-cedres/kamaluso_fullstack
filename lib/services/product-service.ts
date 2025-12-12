import connectDB from '../mongoose';
import Product from '../../models/Product';
import Category from '../../models/Category';

/**
 * Obtiene un resumen de todos los productos para alimentar el contexto del chatbot.
 * Filtra solo la información relevante para minimizar tokens.
 */
export async function getAllProductsForContext() {
    await connectDB();

    // Asegurarse de que Categories esté cargado si es necesario para populate, 
    // aunque aquí solo necesitamos el nombre de la categoría si está disponible.

    // Consultar productos activos. 
    // Nota: El campo 'categoria' es un string, no un ObjectId, por lo que no usamos populate.
    // Consultar productos activos con sus reseñas calculadas
    const products = await Product.aggregate([
        { $match: { status: 'activo' } },
        {
            $lookup: {
                from: 'reviews',
                localField: '_id',
                foreignField: 'product',
                as: 'reviews',
            },
        },
        {
            $addFields: {
                approvedReviews: {
                    $filter: {
                        input: '$reviews',
                        as: 'review',
                        cond: { $eq: ['$$review.isApproved', true] },
                    },
                },
            },
        },
        {
            $addFields: {
                averageRating: { $ifNull: [{ $avg: '$approvedReviews.rating' }, 0] },
                numReviews: { $size: '$approvedReviews' },
            },
        },
        {
            $project: {
                nombre: 1,
                basePrice: 1,
                descripcion: 1,
                descripcionExtensa: 1,
                categoria: 1,
                slug: 1,
                puntosClave: 1,
                averageRating: 1,
                numReviews: 1
            }
        }
    ]);

    return products.map((p: any) => ({
        name: p.nombre,
        price: p.basePrice,
        category: String(p.categoria || 'General'),
        description: String(p.descripcion || ''),
        longDescription: String(p.descripcionExtensa || ''),
        keyPoints: p.puntosClave || [],
        slug: p.slug,
        rating: p.averageRating ? parseFloat(p.averageRating.toFixed(1)) : 0,
        reviewCount: p.numReviews || 0,
        inStock: true
    }));
}
