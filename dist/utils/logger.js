"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const https_1 = __importDefault(require("https"));
const url_1 = __importDefault(require("url"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const LOG_ENDPOINT = process.env.LOG_ENDPOINT || ''; // si vacío -> consola
const LOG_API_KEY = process.env.LOG_API_KEY || '';
exports.logger = {
    console: (...args) => {
        console.log('[LOGGER]', ...args);
    },
    // registra y opcionalmente envía por HTTPS al collector
    logHttp: (method, path, data, level = 'info') => {
        const payload = {
            method,
            path,
            data,
            timestamp: Date.now(),
            level
        };
        // siempre muestro en consola
        console.log(`[HTTP LOG] ${method} ${path}`, JSON.stringify(data || {}));
        if (!LOG_ENDPOINT)
            return;
        try {
            const parsed = url_1.default.parse(LOG_ENDPOINT);
            const body = JSON.stringify(payload);
            const options = {
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
            const req = https_1.default.request(options, (res) => {
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
        }
        catch (err) {
            console.warn('[LOGGER] exception posting log', err.message || err);
        }
    }
};
