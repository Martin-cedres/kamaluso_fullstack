"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withAuth = exports.isAdmin = void 0;
exports.generarToken = generarToken;
// lib/auth.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("next-auth/jwt");
// Clave secreta para JWT
const secret = process.env.NEXTAUTH_SECRET || 'secret_default';
/**
 * Checks if the user is an administrator.
 * @param token The JWT token from next-auth.
 * @returns True if the user has the 'admin' role, false otherwise.
 */
const isAdmin = (token) => {
    return (token === null || token === void 0 ? void 0 : token.role) === 'admin';
};
exports.isAdmin = isAdmin;
/**
 * Genera un token JWT con el payload recibido
 */
function generarToken(payload) {
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '7d' });
}
/**
 * Higher-Order Function para proteger rutas de la API.
 * Envuelve un handler y comprueba la autenticación antes de ejecutarlo.
 */
const withAuth = (handler) => {
    return async (req, res) => {
        const token = await (0, jwt_1.getToken)({ req, secret });
        if (!token) {
            return res
                .status(401)
                .json({ error: 'No autorizado. Debes iniciar sesión.' });
        }
        // Opcional: adjuntar el token/usuario al request si el handler lo necesita
        // (req as any).user = token;
        // Si la autenticación es exitosa, llama al handler original.
        return handler(req, res);
    };
};
exports.withAuth = withAuth;
