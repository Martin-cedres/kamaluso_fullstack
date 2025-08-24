import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Falta el id" });
  const client = await clientPromise;
  const db = client.db();
  let producto = await db.collection("productos").findOne({ _id: new ObjectId(id as string) });
  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
  // Adaptar precios para frontend
  if (producto.tipo === "personalizado" && Array.isArray(producto.variantes)) {
    producto.precioFlex = producto.variantes[0]?.precio || null;
    producto.precioDura = producto.variantes[1]?.precio || null;
  } else {
    producto.precio = producto.precio || producto.price || null;
  }
  res.status(200).json(producto);
}
