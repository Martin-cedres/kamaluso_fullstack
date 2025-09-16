import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import clientPromise from "../../../../lib/mongodb";
import Review from "../../../../models/Review";
import Product from "../../../../models/Product";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  // Verificar si el usuario es administrador
  if (!session || session.user?.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized: Admin access required" });
  }

  await clientPromise; // Asegurarse de que la conexión a la DB está establecida

  if (req.method === "GET") {
    try {
      const { status } = req.query; // Opcional: filtrar por status
      const filter: any = {};
      if (status && typeof status === "string" && ["pending", "approved", "rejected"].includes(status)) {
        filter.status = status;
      }

      const reviews = await Review.find(filter)
        .populate("productId", "nombre imageUrl") // Obtener nombre e imagen del producto
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json(reviews);
    } catch (error) {
      console.error("Error fetching admin reviews:", error);
      return res.status(500).json({ message: "Error fetching reviews", error: String(error) });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
