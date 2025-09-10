import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import clientPromise from "../../../lib/mongodb";
import { requireAuth } from "../../../lib/auth";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Método no permitido" });

  try {
    const { id } = req.query;
    if (!id || typeof id !== "string") return res.status(400).json({ error: "Falta el ID" });

    const client = await clientPromise;
    const db = client.db("kamaluso");

    const result = await db.collection("products").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Producto no encontrado" });

    res.status(200).json({ ok: true, mensaje: "Producto eliminado correctamente" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
}

export default function (req: NextApiRequest, res: NextApiResponse) {
  requireAuth(req, res, () => handler(req, res));
}
