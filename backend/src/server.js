import express from 'express';
import menuRouter from './routes/menu.js';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(menuRouter);

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: error.message || '伺服器錯誤',
    },
  });
});

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  app.listen(PORT, () => {
    console.log(`Menu API running on http://localhost:${PORT}`);
  });
}

export default app;
