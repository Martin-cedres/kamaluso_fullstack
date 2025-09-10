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

    // Parámetros
    const categoriaParam = req.query.categoria as string || "";
    const subCategoriaParam = req.query.subCategoria as string || req.query.subcategoria as string || "";
    const slug = req.query.slug as string || "";
    const _id = req.query._id as string || "";
    const destacadoQuery = req.query.destacado;

    const categoria = categoriaParam ? norm(categoriaParam) : "";
    const subCategoria = subCategoriaParam ? normSubCategoria(subCategoriaParam) : "";

    // Destacado
    let destacadoFilter: boolean | undefined = undefined;
    if (typeof destacadoQuery !== "undefined") {
      const val = String(destacadoQuery).toLowerCase();
      destacadoFilter = val === "true" || val === "1" || val === "yes";
    }

    // Construir query
    const query: any = {};

    if (categoria) query.categoria = { $regex: new RegExp(`^${categoria}$`, "i") };
    if (subCategoria) query.subCategoria = { $regex: new RegExp(`^${subCategoria}$`, "i") };
    if (slug) query.slug = { $regex: new RegExp(`^${slug}$`, "i") };
    if (_id) query._id = new ObjectId(_id);
    if (typeof destacadoFilter !== "undefined") query.destacado = destacadoFilter;

    // Consulta
    const productos = await db
      .collection("products")
      .find(query)
      .sort({ creadoEn: -1 })
      .project({
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
        creadoEn: 1,
        actualizadoEn: 1,
        tapa: 1,
      })
      .toArray();

    // Mapeo
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

    console.log("LISTAR PRODUCTOS:", mapped);

    res.status(200).json(mapped);
  } catch (err) {
    console.error("LISTAR ERROR:", err);
    res.status(500).json({ error: "Error listando productos", detalles: String(err) });
  }
}
