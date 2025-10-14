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

// ✅ Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',
  'https://technova-frontend.onrender.com', // reemplaza si tu frontend cambia
];

// ✅ Configuración CORS correcta para Render y cookies
app.use(
  cors({
    origin(origin, callback) {
      // Permitir sin origin (como Postman) o si está en la lista
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Permite cookies / Authorization headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ Asegurar respuesta a preflight OPTIONS
app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ Middlewares básicos
app.use(express.json());
app.use(cookieParser());

// ✅ Rutas base
app.get('/', (_req, res) => {
  res.send('✅ API online y CORS activo');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ✅ Manejo de errores CORS
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ message: 'CORS blocked: origin not allowed' });
  } else {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ✅ Conexión a MongoDB y arranque del servidor
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error connecting to MongoDB:', err);
  });
