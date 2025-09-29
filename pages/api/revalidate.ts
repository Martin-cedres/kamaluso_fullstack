import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Verificar el token secreto
  if (req.query.secret !== process.env.REVALIDATE_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // 2. Verificar que la petición sea POST y que tenga un path
  if (req.method !== 'POST' || !req.body.path) {
    return res.status(400).json({ message: 'Bad request. Must be a POST request with a path in the body.' });
  }

  try {
    // 3. Regenerar la página usando el path proporcionado
    const pathToRevalidate = req.body.path;
    await res.revalidate(pathToRevalidate);
    console.log(`Revalidated: ${pathToRevalidate}`);
    return res.json({ revalidated: true, path: pathToRevalidate });
  } catch (err) {
    // Si hay un error, Next.js mostrará la última página generada con éxito.
    console.error(`Error revalidating ${req.body.path}:`, err);
    return res.status(500).send('Error revalidating');
  }
}
