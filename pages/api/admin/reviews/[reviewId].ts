import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import clientPromise from "../../../../lib/mongodb";
import Review from "../../../../models/Review";
import mongoose from "mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  // Verificar si el usuario es administrador
  if (!session || session.user?.role !== "admin") {
    return res.status(401).json({ message: "Unauthorized: Admin access required" });
  }

  const { reviewId } = req.query;

  if (!reviewId || typeof reviewId !== "string" || !mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ message: "Invalid Review ID" });
  }

  await clientPromise; // Asegurarse de que la conexión a la DB está establecida

  if (req.method === "DELETE") {
    try {
      const reviewToDelete = await Review.findById(reviewId);

      if (!reviewToDelete) {
        return res.status(404).json({ message: "Review not found" });
      }

      await reviewToDelete.deleteOne();

      return res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error("Error deleting review:", error);
      return res.status(500).json({ message: "Error deleting review", error: String(error) });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
