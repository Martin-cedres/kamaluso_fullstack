// pages/api/products/listar.ts
import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

// Funciones de normalización
function norm(str: string) {
  return String(str || "").trim().toLowerCase().replace(/\s+/g, "-");
}

function normSubCategoria(s: string) {
  const v = norm(s);
  if (["flex", "tapa-flex", "tapas-flex"].includes(v)) return "tapas-flex";
  if (["dura", "tapa-dura", "tapas-dura"].includes(v)) return "tapas-dura";
  return v;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const db = (await clientPromise).db("kamaluso");
    const { query: reqQuery } = req;

    // --- PARÁMETROS ---
    const getQueryParam = (param: string | string[] | undefined): string => {
      if (Array.isArray(param)) return param[0];
      return param || "";
    };

    const categoriaParam = getQueryParam(reqQuery.categoria);
    const subCategoriaParam = getQueryParam(reqQuery.subCategoria) || getQueryParam(reqQuery.subcategoria);
    const slug = getQueryParam(reqQuery.slug);
    const _id = getQueryParam(reqQuery._id);
    const search = getQueryParam(reqQuery.search);
    const page = getQueryParam(reqQuery.page) || "1";
    const limit = getQueryParam(reqQuery.limit) || "12";
    const destacadoQuery = reqQuery.destacado;

    const categoria = categoriaParam ? norm(categoriaParam) : "";
    const subCategoria = subCategoriaParam ? normSubCategoria(subCategoriaParam) : "";

    // Paginación
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Filtro de destacado
    let destacadoFilter: boolean | undefined = undefined;
    if (typeof destacadoQuery !== "undefined") {
      const val = String(destacadoQuery).toLowerCase();
      destacadoFilter = val === "true" || val === "1" || val === "yes";
    }

    // --- CONSTRUIR QUERY ---
    const query: any = {};

    if (categoria) query.categoria = { $regex: new RegExp(`^${categoria}$`, "i") };
    if (subCategoria) query.subCategoria = { $regex: new RegExp(`^${subCategoria}$`, "i") };
    if (slug) query.slug = { $regex: new RegExp(`^${slug}$`, "i") };
    if (_id) query._id = new ObjectId(_id);
    if (typeof destacadoFilter !== "undefined") query.destacado = destacadoFilter;

    // Añadir filtro de búsqueda
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { nombre: searchRegex },
        { descripcion: searchRegex },
        { seoKeywords: searchRegex },
      ];
    }

    // --- CONSULTAS A DB ---
    const [productos, total] = await Promise.all([
      db
        .collection("products")
        .find(query)
        .sort({ creadoEn: -1 })
        .skip(skip)
        .limit(limitNum)
        .project({
          nombre: 1, slug: 1, descripcion: 1, precio: 1, precioFlex: 1,
          precioDura: 1, categoria: 1, subCategoria: 1, seoTitle: 1,
          seoDescription: 1, seoKeywords: 1, alt: 1, notes: 1, status: 1,
          destacado: 1, imageUrl: 1, images: 1, creadoEn: 1, actualizadoEn: 1,
          tapa: 1,
        })
        .toArray(),
      db.collection("products").countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    // --- MAPEO Y RESPUESTA ---
    const mapped = productos.map((p: any) => ({
      _id: p._id,
      nombre: p.nombre,
      slug: p.slug || "",
      descripcion: p.descripcion || "",
      precio: p.precio,
      precioFlex: p.precioFlex,
      precioDura: p.precioDura,
      categoria: p.categoria || "",
      subCategoria: Array.isArray(p.subCategoria) ? p.subCategoria : (p.subCategoria ? [p.subCategoria] : []),
      seoTitle: p.seoTitle || "",
      seoDescription: p.seoDescription || "",
      seoKeywords: p.seoKeywords || [],
      alt: p.alt || "",
      notes: p.notes || "",
      status: p.status || "activo",
      destacado: !!p.destacado,
      imageUrl: p.imageUrl || "",
      images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
      creadoEn: p.creadoEn || null,
      actualizadoEn: p.actualizadoEn || null,
      tapa: p.tapa || "",
    }));

    res.status(200).json({
      products: mapped,
      currentPage: pageNum,
      totalPages,
    });
  } catch (err) {
    console.error("LISTAR ERROR:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Error listando productos", detalles: errorMessage });
  }
}