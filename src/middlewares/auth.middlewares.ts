import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Middleware de autenticación:
 * - Acepta token desde header Authorization: Bearer <token>
 * - O desde cookie httpOnly "token"
 */
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 🧠 Buscar cookie si existe
  if (req.cookies?.token) token = req.cookies.token;

  // 🧠 Si no hay cookie, usar header Authorization
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware para proteger rutas de administrador
 */
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: 'No user' });
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Requires admin role' });
  next();
};
