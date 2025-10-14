import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/products.routes';
import { logger } from './utils/logger';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 4000;

// ⚡ Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',
  'https://technova-frontend.onrender.com'
];

// ⚙️ Middleware CORS manual (en vez de cors())
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );

  // Manejar preflight (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// ✅ Middlewares normales
app.use(express.json());
app.use(cookieParser());

// ✅ Rutas base
app.get('/', (_req, res) => res.send('✅ API online con CORS fijo'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// ✅ Error general
app.use((err: any, _req: express.Request, res: express.Response, _next: any) => {
  console.error('Error general:', err);
  res.status(500).json({ message: err.message || 'Server error' });
});

// ✅ Conexión a DB y arranque
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
  });
