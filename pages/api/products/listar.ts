
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
    const sortParam = getQueryParam(reqQuery.sort);

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
    const andConditions: any[] = [];

    // Si no se pide una categoría específica, excluimos sublimables por defecto (retail view)
    if (!categoriaParam) {
      andConditions.push({ categoria: { $ne: 'papeleria-sublimable' } });
    }

    if (categoria) {
      const categoryDoc = await db.collection('categories').findOne({ slug: categoria });

      if (categoryDoc) {
        const subCategoryCount = await db.collection('categories').countDocuments({ parent: categoryDoc._id });

        if (subCategoryCount > 0) {
          // Es una categoría padre, no devolver productos.
          res.setHeader('Cache-Control', 'no-store, max-age=0');
          return res.status(200).json({
            products: [],
            currentPage: pageNum,
            totalPages: 0,
          });
        }

        // Es una categoría hoja, buscar productos que le pertenezcan.
        const slugsToQuery = [categoria];
        andConditions.push({
          $or: [
            { categoria: { $in: slugsToQuery } },
            { subCategoria: { $in: slugsToQuery } }
          ]
        });

      } else {
        // Si no se encuentra la categoría, no devolver productos.
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        return res.status(200).json({
          products: [],
          currentPage: pageNum,
          totalPages: 0,
        });
      }
    }

    if (subCategoria) andConditions.push({ subCategoria: { $regex: new RegExp(`^${subCategoria}$`, 'i') } });
    if (slug) andConditions.push({ slug: { $regex: new RegExp(`^${slug}$`, 'i') } });
    if (_id) andConditions.push({ _id: new ObjectId(_id) });
    if (typeof destacadoFilter !== 'undefined') andConditions.push({ destacado: destacadoFilter });

    // Filtro por precio máximo (para sugerencias de carrito)
    const maxPriceParam = getQueryParam(reqQuery.maxPrice);
    if (maxPriceParam) {
      const maxPrice = parseFloat(maxPriceParam);
      if (!isNaN(maxPrice)) {
        andConditions.push({
          $or: [
            { basePrice: { $lte: maxPrice } },
            { precio: { $lte: maxPrice } }
          ]
        });
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      andConditions.push({
        $or: [
          { nombre: searchRegex },
          { descripcion: searchRegex },
          { seoKeywords: searchRegex },
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const aggregationPipeline = [
      { $match: query },
      { $sort: sortParam === 'order' ? { order: 1, createdAt: -1 } : { createdAt: -1 } },
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
          nombre: 1,
          slug: 1,
          descripcion: 1,
          descripcionBreve: 1,
          descripcionExtensa: 1,
          puntosClave: 1,
          basePrice: 1, // Asegurarse de incluir basePrice
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
          contentStatus: 1, // <--- AÑADIR ESTE CAMPO
          destacado: 1,
          imageUrl: 1,
          images: 1,
          createdAt: 1,
          updatedAt: 1,
          tapa: 1,
          averageRating: 1,
          numReviews: 1,
          order: 1, // Incluir el campo order en la proyección
        },
      },
    ];

    const [productos, total] = await Promise.all([
      db.collection('products').aggregate(aggregationPipeline).toArray(),
      db.collection('products').countDocuments(query),
    ]);

    // FUZZY SEARCH FALLBACK: Si no hay resultados y hay búsqueda activa, intentar búsqueda fuzzy
    let finalProducts = productos;
    let finalTotal = total;

    if (search && productos.length === 0) {
      // Importar fuzzy search utilities
      const { fuzzySearch } = await import('../../../lib/fuzzySearch');

      // Obtener todos los productos para búsqueda fuzzy (sin filtros de search)
      const fuzzyQuery = { ...query };
      if (fuzzyQuery.$and) {
        // Remover el filtro de búsqueda para obtener todos los productos
        fuzzyQuery.$and = fuzzyQuery.$and.filter((condition: any) => !condition.$or || !condition.$or.some((c: any) => c.nombre));
        if (fuzzyQuery.$and.length === 0) delete fuzzyQuery.$and;
      }

      const allProducts = await db.collection('products')
        .find(fuzzyQuery)
        .limit(100) // Limitar a 100 productos para performance
        .toArray();

      // Aplicar fuzzy search con threshold más estricto
      const fuzzyResults = fuzzySearch(search, allProducts, 'nombre', 0.65);

      if (fuzzyResults.length > 0) {
        // Tomar solo los top resultados según limit
        const topFuzzyResults = fuzzyResults.slice(skip, skip + limitNum);

        // Enriquecer con reviews usando el mismo pipeline
        const enrichedResults = await Promise.all(
          topFuzzyResults.map(async (product) => {
            const [productWithReviews] = await db.collection('products').aggregate([
              { $match: { _id: product._id } },
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
                  nombre: 1,
                  slug: 1,
                  descripcion: 1,
                  descripcionBreve: 1,
                  descripcionExtensa: 1,
                  puntosClave: 1,
                  basePrice: 1,
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
                  contentStatus: 1,
                  destacado: 1,
                  imageUrl: 1,
                  images: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  tapa: 1,
                  averageRating: 1,
                  numReviews: 1,
                  order: 1,
                },
              },
            ]).toArray();

            return productWithReviews;
          })
        );

        finalProducts = enrichedResults;
        finalTotal = fuzzyResults.length;
      }
    }

    const totalPages = Math.ceil(finalTotal / limitNum);

    const mapped = finalProducts.map((p: any) => ({
      ...p,
      averageRating: p.averageRating === null ? 0 : p.averageRating,
      numReviews: p.numReviews || 0,
    }));

    res.setHeader('Cache-Control', 'no-store, max-age=0');
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
