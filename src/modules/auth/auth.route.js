import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import db from '../../models/index.js';

const router = Router();
const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8)
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, name, password } = registerSchema.parse(req.body);
    const existed = await db.User.findOne({ where: { email } });
    if (existed) return res.status(409).json({ message: 'Email exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.User.create({ email, name, passwordHash });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await db.User.findOne({ where: { email } });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '15m' });
    res.json({ accessToken: token });
  } catch (e) { next(e); }
});

export default router;
