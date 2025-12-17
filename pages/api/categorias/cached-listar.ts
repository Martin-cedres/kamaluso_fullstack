// pages/api/categorias/cached-listar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

// This is a simple in-memory cache.
// In a real-world scenario, you might use a more robust caching solution like Redis.
let cachedCategories: any[] | null = null;
let lastCacheTime: number | null = null;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

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

  const now = Date.now();
  // Check if cache is still valid
  if (cachedCategories && lastCacheTime && (now - lastCacheTime < CACHE_DURATION)) {
    // Set Cache-Control header for Vercel's edge network and browsers
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
    return res.status(200).json(cachedCategories);
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

    categorias.forEach(cat => {
      categoryMap[cat._id.toString()] = { ...cat, children: [] };
    });

    categorias.forEach(cat => {
      if (cat.parent) {
        const parentId = cat.parent.toString();
        if (categoryMap[parentId]) {
          categoryMap[parentId].children.push(categoryMap[cat._id.toString()]);
        }
      } else {
        rootCategories.push(categoryMap[cat._id.toString()]);
      }
    });

    // Store the result in the in-memory cache
    cachedCategories = JSON.parse(JSON.stringify(rootCategories));
    lastCacheTime = now;

    // Set Cache-Control header for Vercel's edge network and browsers
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');

    res.status(200).json(cachedCategories)
  } catch (err) {
    console.error(err)
    // Don't cache errors
    cachedCategories = null; 
    lastCacheTime = null;
    res.status(500).json({ error: 'Error al obtener las categorías' })
  }
}
