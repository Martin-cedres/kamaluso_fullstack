// lib/auth.ts
import jwt from 'jsonwebtoken'
import { getToken } from 'next-auth/jwt'
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'

// Clave secreta para JWT
const secret = process.env.NEXTAUTH_SECRET || 'secret_default'

/**
 * Genera un token JWT con el payload recibido
 */
export function generarToken(payload: any) {
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

/**
 * Higher-Order Function para proteger rutas de la API.
 * Envuelve un handler y comprueba la autenticación antes de ejecutarlo.
 */
export const withAuth = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = await getToken({ req, secret })

    if (!token) {
      return res
        .status(401)
        .json({ error: 'No autorizado. Debes iniciar sesión.' })
    }

    // Opcional: adjuntar el token/usuario al request si el handler lo necesita
    // (req as any).user = token;

    // Si la autenticación es exitosa, llama al handler original.
    return handler(req, res)
  }
}