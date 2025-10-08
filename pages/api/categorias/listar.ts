// pages/api/categorias/listar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb';

// Local interface definition for clarity in this file
interface Category {
  _id: ObjectId | string;
  nombre: string;
  slug: string;
  parent?: ObjectId | string;
  children?: Category[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const client = await clientPromise
    const db = client.db('kamaluso')

    const categorias = await db
      .collection('categories')
      .find({})
      .sort({ nombre: 1 })
      .toArray();

    const categoryMap: { [key: string]: any } = {};
    const rootCategories: Category[] = [];

    // Initialize map and add children array to each category
    categorias.forEach(cat => {
      categoryMap[cat._id.toString()] = { ...cat, children: [] };
    });

    // Build the hierarchy by assigning children to their parents
    categorias.forEach(cat => {
      if (cat.parent) {
        const parentId = cat.parent.toString();
        // Ensure the parent category exists in the map before trying to push a child to it
        if (categoryMap[parentId]) {
          categoryMap[parentId].children.push(categoryMap[cat._id.toString()]);
        }
      } else {
        // If a category has no parent, it's a root category
        rootCategories.push(categoryMap[cat._id.toString()]);
      }
    });

    res.status(200).json(rootCategories)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener las categorías' })
  }
}
