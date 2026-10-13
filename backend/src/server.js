import './polyfills/nodePromiseWithResolvers.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import menuRouter from './routes/menu.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import merchantOrdersRouter from './routes/merchantOrders.js';
import { getAllowedOrigins } from './services/cartService.js';
import { ensureDatabaseReady } from './config/db.js';
import { startSessionMaintenance } from './jobs/sessionMaintenance.js';
import { logServerError } from './utils/safeLogger.js';

const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env');
const isMainServer = Boolean(process.argv[1]?.endsWith('server.js'));
if (isMainServer) {
  try {
    const { default: dotenv } = await import('dotenv');
    dotenv.config({ path: envPath });
  } catch {
    // dotenv optional until npm install completes
  }
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

await ensureDatabaseReady();
startSessionMaintenance();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    if (!origin || !allowedOrigins.has(origin)) {
      return res.sendStatus(403);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, X-CSRF-Token, Idempotency-Key, X-Merchant-Token'
    );
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());
app.use(menuRouter);
app.use(cartRouter);
app.use(ordersRouter);
app.use(merchantOrdersRouter);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  logServerError('http.unhandled', error, { path: req.path, method: req.method });
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: '伺服器錯誤',
    },
  });
});

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  app.listen(PORT, () => {
    console.log(`Menu API running on http://localhost:${PORT}`);
  });
}

export default app;
