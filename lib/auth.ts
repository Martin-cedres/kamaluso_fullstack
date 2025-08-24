import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

// La clave secreta DEBE ser la misma que usas en la configuración de NextAuth
const secret = process.env.NEXTAUTH_SECRET;

/**
 * Middleware de autenticación para proteger rutas de la API.
 * Verifica la sesión del usuario usando el token JWT de NextAuth que viaja en las cookies.
 */
export async function requireAuth(req: NextApiRequest, res: NextApiResponse, next: () => void) {
  const token = await getToken({ req, secret });

  if (!token) {
    // Si no hay token, el usuario no está autenticado.
    return res.status(401).json({ error: "No autorizado. Debes iniciar sesión." });
  }

  // Si el token es válido, adjuntamos la información del usuario a la petición
  // para que esté disponible en los siguientes manejadores.
  (req as any).user = token;

  // Llama a la siguiente función en la cadena de middleware/API
  next();
}