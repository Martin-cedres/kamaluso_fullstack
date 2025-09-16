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

  if (req.method === "POST") {
    try {
      await clientPromise; // Asegurarse de que la conexión a la DB está establecida

      const { reviewId } = req.body;

      if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({ message: "Invalid Review ID" });
      }

      const updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        { status: "rejected" },
        { new: true }
      );

      if (!updatedReview) {
        return res.status(404).json({ message: "Review not found" });
      }

      return res.status(200).json({ message: "Review rejected successfully", review: updatedReview });
    } catch (error) {
      console.error("Error rejecting review:", error);
      return res.status(500).json({ message: "Error rejecting review", error: String(error) });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
