import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_DB = 'assets';
const MONGO_URI_RAW = process.env.MONGO_URI || `mongodb://localhost:27017/${DEFAULT_DB}`;

function ensureDbName(uri: string): string {
  // remove query string for inspection
  const withoutQuery = uri.split('?')[0];
  // if there's a slash followed by a non-empty segment after host, assume DB present
  const hasDb = /\/.+/.test(withoutQuery.replace(/^mongodb(\+srv)?:\/\//, ''));
  if (hasDb) return uri;
  // append default DB name
  return uri.replace(/\/?$/, '/') + DEFAULT_DB;
}

const MONGO_URI = ensureDbName(MONGO_URI_RAW);

export const connectDB = async (opts?: { retries?: number; retryDelayMs?: number }) => {
  const retries = opts?.retries ?? 5;
  const retryDelayMs = opts?.retryDelayMs ?? 2000;

  // keep strictQuery false to avoid deprecation warnings for older code
  try {
    mongoose.set('strictQuery', false as any);
  } catch (e) {
    // ignore if not supported
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log('✅ MongoDB connected to', MONGO_URI);

      mongoose.connection.on('error', (err) => console.error('MongoDB connection error', err));
      mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, err);
      if (attempt < retries) {
        const wait = retryDelayMs * attempt;
        console.log(`Retrying MongoDB connection in ${wait} ms...`);
        await new Promise((res) => setTimeout(res, wait));
      } else {
        console.error('❌ MongoDB connection failed after retries.');
        process.exit(1);
      }
    }
  }
};
