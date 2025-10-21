import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

import authRoute from './modules/auth/auth.route.js';
import accountRoute from './modules/accounts/account.route.js';
import transferRoute from './modules/transfers/transfer.route.js';
import errorHandler from './middlewares/error.js';

dotenv.config();
const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoute);
app.use('/api/accounts', accountRoute);
app.use('/api/transfers', transferRoute);

app.use(errorHandler);
export default app;
