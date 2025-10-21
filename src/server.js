import dotenv from 'dotenv';
import app from './app.js';
import logger from './config/logger.js';
import db from './models/index.js';

dotenv.config();
const port = process.env.PORT || 3000;

(async () => {
  try {
    await db.sequelize.authenticate();
    logger.info('DB connected');
    app.listen(port, () => logger.info(`Server on http://localhost:${port}`));
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
})();
