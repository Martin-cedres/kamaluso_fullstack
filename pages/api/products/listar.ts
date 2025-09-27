
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Funciones de normalización
function norm(str: string) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function normSubCategoria(s: string) {
  const v = norm(s);
  if (['flex', 'tapa-flex', 'tapas-flex'].includes(v)) return 'tapas-flex';
  if (['dura', 'tapa-dura', 'tapas-dura'].includes(v)) return 'tapas-dura';
  return v;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const db = (await clientPromise).db('kamaluso');
    const { query: reqQuery } = req;

    const getQueryParam = (param: string | string[] | undefined): string => {
      if (Array.isArray(param)) return param[0];
      return param || '';
    };

    const categoriaParam = getQueryParam(reqQuery.categoria);
    const subCategoriaParam =
      getQueryParam(reqQuery.subCategoria) ||
      getQueryParam(reqQuery.subcategoria);
    const slug = getQueryParam(reqQuery.slug);
    const _id = getQueryParam(reqQuery._id);
    const search = getQueryParam(reqQuery.search);
    const page = getQueryParam(reqQuery.page) || '1';
    const limit = getQueryParam(reqQuery.limit) || '12';
    const destacadoQuery = reqQuery.destacado;

    const categoria = categoriaParam ? norm(categoriaParam) : '';
    const subCategoria = subCategoriaParam
      ? normSubCategoria(subCategoriaParam)
      : '';

    // Paginación
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Filtro de destacado
    let destacadoFilter: boolean | undefined = undefined;
    if (typeof destacadoQuery !== 'undefined') {
      const val = String(destacadoQuery).toLowerCase();
      destacadoFilter = val === 'true' || val === '1' || val === 'yes';
    }

    // --- CONSTRUIR QUERY ---
    const query: any = {};

    if (categoria) query.categoria = { $regex: new RegExp(`^${categoria}$`, 'i') };
    if (subCategoria) query.subCategoria = { $regex: new RegExp(`^${subCategoria}$`, 'i') };
    if (slug) query.slug = { $regex: new RegExp(`^${slug}$`, 'i') };
    if (_id) query._id = new ObjectId(_id);
    if (typeof destacadoFilter !== 'undefined') query.destacado = destacadoFilter;

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { nombre: searchRegex },
        { descripcion: searchRegex },
        { seoKeywords: searchRegex },
      ];
    }

    const aggregationPipeline = [
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
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
          averageRating: { $avg: '$approvedReviews.rating' },
          numReviews: { $size: '$approvedReviews' },
        },
      },
      {
        $project: {
          // No mezclar inclusiones y exclusiones. Solo incluir lo necesario.
          // _id se incluye por defecto.
          nombre: 1,
          slug: 1,
          descripcion: 1,
          precio: 1,
          precioFlex: 1,
          precioDura: 1,
          categoria: 1,
          subCategoria: 1,
          seoTitle: 1,
          seoDescription: 1,
          seoKeywords: 1,
          alt: 1,
          notes: 1,
          status: 1,
          destacado: 1,
          imageUrl: 1,
          images: 1,
          createdAt: 1,
          updatedAt: 1,
          tapa: 1,
          averageRating: 1,
          numReviews: 1,
        },
      },
    ];

    const [productos, total] = await Promise.all([
      db.collection('products').aggregate(aggregationPipeline).toArray(),
      db.collection('products').countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const mapped = productos.map((p: any) => ({
      ...p,
      averageRating: p.averageRating === null ? 0 : p.averageRating,
      numReviews: p.numReviews || 0,
    }));

    res.status(200).json({
      products: mapped,
      currentPage: pageNum,
      totalPages,
    });

  } catch (err) {
    console.error('LISTAR ERROR:', err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res
      .status(500)
      .json({ error: 'Error listando productos', detalles: errorMessage });
  }
}
