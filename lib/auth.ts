// lib/auth.ts
import jwt from "jsonwebtoken";

// Clave secreta para JWT
const secret = process.env.NEXTAUTH_SECRET || "secret_default";

/**
 * Genera un token JWT con el payload recibido
 */
export function generarToken(payload: any) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

/**
 * Middleware para proteger rutas de la API
 */
import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

export async function requireAuth(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const token = await getToken({ req, secret });

  if (!token) {
    return res.status(401).json({ error: "No autorizado. Debes iniciar sesión." });
  }

  (req as any).user = token;
  next();
}
