import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import { logger } from './utils/logger';

dotenv.config();
const app = express();

// ✅ Configurar CORS correctamente
const allowedOrigins = [
  'http://localhost:5173',               // dev
  'https://technova-backend-tzkn.onrender.com' // <-- tu frontend en Render
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Middlewares base
app.use(express.json());

// ✅ Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ✅ Base route
app.get('/', (_, res) => res.send('✅ API funcionando correctamente'));

// ✅ Arrancar servidor
const PORT = process.env.PORT || 4000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
});
