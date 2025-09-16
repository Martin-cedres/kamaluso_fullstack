import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import clientPromise from "../../../lib/mongodb";
import Review from "../../../models/Review";
import Product from "../../../models/Product"; // Importar el modelo de Producto

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      await clientPromise; // Asegurarse de que la conexión a la DB está establecida

      const { productId, rating, comment, imageUrls } = req.body;

      if (!productId || !rating || !comment) {
        return res.status(400).json({ message: "Missing required fields: productId, rating, comment" });
      }

      // Verificar que el producto existe
      const productExists = await Product.findById(productId);
      if (!productExists) {
        return res.status(404).json({ message: "Product not found" });
      }

      const newReview = new Review({
        productId,
        userId: session.user.id, // Asumiendo que el ID del usuario está en la sesión
        userName: session.user.name || session.user.email, // Usar nombre o email
        userEmail: session.user.email,
        rating: Number(rating),
        comment,
        imageUrls: imageUrls || [],
        status: "pending", // Por defecto, las reseñas están pendientes de aprobación
      });

      await newReview.save();

      return res.status(201).json({ message: "Review submitted successfully", review: newReview });
    } catch (error) {
      console.error("Error submitting review:", error);
      return res.status(500).json({ message: "Error submitting review", error: String(error) });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
