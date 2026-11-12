import { env } from './config/env.js';
import app from './app.js';

app.listen(env.port, () => {
  console.log(`API запущен: http://localhost:${env.port}/api/health`);
});
