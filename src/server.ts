import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/products.routes';
import { logger } from './utils/logger';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 4000;

// ✅ Configurar CORS correctamente
const allowedOrigins = [
  'http://localhost:5173',
  'https://technova-frontend.onrender.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ CORS preflight (para asegurarnos que responda a OPTIONS)
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ Middlewares base
app.use(express.json());
app.use(cookieParser());

// ✅ Test simple
app.get('/', (_, res) => res.send('✅ API online y CORS activo'));

// ✅ Rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ✅ Conexión y arranque
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server ready on port ${PORT}`);
  });
});
