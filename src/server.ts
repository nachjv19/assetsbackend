import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/products.routes";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5500;

// dominio del front (ajusta en .env). Por defecto para desarrollo colocamos localhost:3000
const FRONT_URL = process.env.FRONT_URL || "http://localhost:5173";

// Forzar headers CORS básicos (útil para diagnosticar proxies que puedan sobrescribir)
app.use((req, res, next) => {
  const origin = FRONT_URL;
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Usar middleware oficial de CORS (mantener configuración estándar)
app.use(cors({
  origin: FRONT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/", (_, res) => res.send("API online con CORS fijo"));

// Endpoint de diagnóstico: devuelve headers de petición y headers CORS actuales
app.get('/debug/cors', (req, res) => {
  const currentCors = {
    'Access-Control-Allow-Origin': res.getHeader('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Credentials': res.getHeader('Access-Control-Allow-Credentials'),
    'Access-Control-Allow-Methods': res.getHeader('Access-Control-Allow-Methods'),
    'Access-Control-Allow-Headers': res.getHeader('Access-Control-Allow-Headers'),
  };
  res.json({ incomingHeaders: req.headers, responseCorsHeaders: currentCors });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
