import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../../lib/mongodb";
import Review from "../../../../models/Review";
import mongoose from "mongoose";

const REVIEWS_PER_PAGE = 5;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { productId, page = '1' } = req.query;

  if (!productId || typeof productId !== "string") {
    return res.status(400).json({ message: "Product ID is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid Product ID format" });
  }

  const currentPage = parseInt(page as string, 10);
  if (isNaN(currentPage) || currentPage < 1) {
    return res.status(400).json({ message: "Invalid page number" });
  }

  try {
    await clientPromise;

    const skip = (currentPage - 1) * REVIEWS_PER_PAGE;

    const reviews = await Review.find({
      productId: new mongoose.Types.ObjectId(productId),
      status: "approved",
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(REVIEWS_PER_PAGE)
      .lean();

    // No es necesario devolver el total aquí, pero la opción existe si se necesita
    // const totalReviews = await Review.countDocuments({
    //   productId: new mongoose.Types.ObjectId(productId),
    //   status: "approved",
    // });

    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return res.status(500).json({ message: "Error fetching reviews", error: String(error) });
  }
}