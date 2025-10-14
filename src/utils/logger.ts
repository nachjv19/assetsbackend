import https from 'https';
import url from 'url';
import dotenv from 'dotenv';
dotenv.config();

const LOG_ENDPOINT = process.env.LOG_ENDPOINT || ''; // si vacío -> consola
const LOG_API_KEY = process.env.LOG_API_KEY || '';

type LogPayload = {
  method: string;
  path: string;
  data?: any;
  timestamp?: number;
  level?: 'info' | 'warn' | 'error';
};

export const logger = {
  console: (...args: any[]) => {
    console.log('[LOGGER]', ...args);
  },

  // registra y opcionalmente envía por HTTPS al collector
  logHttp: (method: string, path: string, data?: any, level: LogPayload['level'] = 'info') => {
    const payload: LogPayload = {
      method,
      path,
      data,
      timestamp: Date.now(),
      level
    };

    // siempre muestro en consola
    console.log(`[HTTP LOG] ${method} ${path}`, JSON.stringify(data || {}));

    if (!LOG_ENDPOINT) return;

    try {
      const parsed = url.parse(LOG_ENDPOINT);
      const body = JSON.stringify(payload);

      const options: https.RequestOptions = {
        hostname: parsed.hostname,
        port: parsed.port ? parseInt(parsed.port) : 443,
        path: parsed.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...(LOG_API_KEY ? { 'x-api-key': LOG_API_KEY } : {})
        }
      };

      const req = https.request(options, (res) => {
        // opcional: leer respuesta
        let resp = '';
        res.on('data', (chunk) => (resp += chunk));
        res.on('end', () => {
          // no hacer crash si collector falla
          if (res.statusCode && res.statusCode >= 400) {
            console.warn('[LOGGER] remote log failed', res.statusCode, resp);
          }
        });
      });

      req.on('error', (err) => {
        console.warn('[LOGGER] error sending log', err.message);
      });

      req.write(body);
      req.end();
    } catch (err: any) {
      console.warn('[LOGGER] exception posting log', err.message || err);
    }
  }
};
