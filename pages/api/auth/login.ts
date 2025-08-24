import type { NextApiRequest, NextApiResponse } from 'next';
import { generarToken } from '../../../lib/auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = generarToken({ email });
    return res.status(200).json({ token });
  }
  return res.status(401).json({ error: 'Credenciales incorrectas' });
}
