import { Router } from 'express';
import { z } from 'zod';
import { authRequired } from '../../middlewares/auth.js';
import { createTransfer } from './transfer.service.js';
import db from '../../models/index.js';

const router = Router();
router.use(authRequired);

const postSchema = z.object({
  fromAccountId: z.string().uuid(),
  toAccountId: z.string().uuid(),
  amount: z.number().int().positive(),
  currency: z.string().length(3).default('VND')
});

router.post('/', async (req, res, next) => {
  try {
    const idem = req.get('Idempotency-Key');
    if (!idem) return res.status(428).json({ message: 'Idempotency-Key required' });
    const { fromAccountId, toAccountId, amount, currency } = postSchema.parse(req.body);

    // đảm bảo user chỉ chuyển từ account của chính mình
    const from = await db.Account.findOne({ where: { id: fromAccountId, userId: req.user.id } });
    if (!from) return res.status(403).json({ message: 'Forbidden' });

    const tr = await createTransfer({
      fromAccountId, toAccountId, amount, currency, idempotencyKey: idem, actor: req.user.id
    });
    res.status(201).json({ id: tr.id, status: tr.status });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res) => {
  const tr = await db.Transfer.findByPk(req.params.id);
  if (!tr) return res.status(404).json({ message: 'Not found' });
  res.json(tr);
});

export default router;
