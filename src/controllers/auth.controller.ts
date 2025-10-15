import { Request, Response } from 'express';
import UserModel from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AuthRequest } from '../middlewares/auth.middlewares';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24hs';

// 🧩 Registro de usuario
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'Missing fields' });

    const exists = await UserModel.findOne({ $or: [{ username }, { email }] });
    if (exists)
      return res.status(409).json({ message: 'User or email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      username,
      email,
      password: hashed,
      role: 'user',
      createdAt: Date.now(),
    });

    logger.logHttp('POST', '/auth/register', { id: user._id, username: user.username });
    res.status(201).json({ message: 'User created', id: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔐 Login de usuario (JWT + Cookie segura)
export const login = async (req: Request, res: Response) => {
  try {
    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password)
      return res.status(400).json({ message: 'Missing fields' });

    const user = await UserModel.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // ✅ Generar JWT (sin errores de tipado)
    const payload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    } as object;

    const options: jwt.SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    const token = jwt.sign(payload, JWT_SECRET as jwt.Secret, options);

    // ✅ Enviar cookie segura httpOnly + mantener compatibilidad con header
    // cookie options: para que funcione en desarrollo con localhost usamos secure=false y sameSite=lax
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd, // true en producción
      sameSite: isProd ? 'none' : 'lax', // 'none' requiere secure, así que sólo en prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    logger.logHttp('POST', '/auth/login', { id: user._id, username: user.username });

    res.json({
      message: 'Login successful',
      token, // aún se envía por compatibilidad con Postman
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🚪 Logout (elimina cookie)
export const logout = async (_req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.json({ message: 'Logout successful' });
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ user: req.user });
};
