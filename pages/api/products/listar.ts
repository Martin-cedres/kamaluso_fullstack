import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }

  try {
    const client = await clientPromise;
    const db = client.db("kamaluso");

    const productos = await db
      .collection("products")
      .find({})
      .project({ 
        nombre: 1, 
        precio: 1, 
        precioFlex: 1,
        precioDura: 1,
        imagen: 1,
        imagenesSecundarias: 1, // <--- agregado
        alt: 1,
        slug: 1,
        status: 1,
        categoria: 1,
        destacado: 1 
      })
      .toArray();

    const productosParaAdmin = productos.map(p => ({
      _id: p._id,
      nombre: p.nombre,
      precio: p.precio,
      precioFlex: p.precioFlex,
      precioDura: p.precioDura,
      imageUrl: p.imagen,
      imagenesSecundarias: p.imagenesSecundarias || [], // <--- agregado
      alt: p.alt || "",
      slug: p.slug || "",
      status: p.status || "activo",
      categoria: p.categoria || "sublimable",
      destacado: p.destacado || false,
    }));

    res.status(200).json(productosParaAdmin);
  } catch (error) {
    console.error("Error al listar productos:", error);
    res.status(500).json({ error: "Error interno al listar productos" });
  }
}
