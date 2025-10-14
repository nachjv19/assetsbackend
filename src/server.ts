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
const FRONT_URL = process.env.FRONT_URL || "https://technova-backend-tzkn.onrender.com";

// Usar middleware oficial de CORS para permitir credentials (cookies) desde el frontend
app.use(cors({
  origin: FRONT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/", (_, res) => res.send("API online con CORS fijo"));

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
