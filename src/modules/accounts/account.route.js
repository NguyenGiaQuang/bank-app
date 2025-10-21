import { Router } from 'express';
import { z } from 'zod';
import { authRequired } from '../../middlewares/auth.js';
import db from '../../models/index.js';
import { getOrCreateTreasuryAccount } from './account.service.js';


const router = Router();

router.use(authRequired);

router.get('/', async (req, res) => {
  const accounts = await db.Account.findAll({ where: { userId: req.user.id }, order: [['createdAt','ASC']] });
  res.json(accounts);
});

router.post('/', async (req, res, next) => {
  try {
    const schema = z.object({ number: z.string().min(6).max(20).optional() });
    const { number } = schema.parse(req.body);
    const acct = await db.Account.create({
      userId: req.user.id,
      number: number || String(Math.floor(1e8 + Math.random() * 9e8)),
      currency: 'VND'
    });
    res.status(201).json(acct);
  } catch (e) { next(e); }
});

router.get('/:id/balance', async (req, res) => {
  // Bản v1: trả balance cache; v2 có thể aggregate từ ledger_entries
  const acct = await db.Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!acct) return res.status(404).json({ message: 'Not found' });
  res.json({ accountId: acct.id, balance: Number(acct.balance) });
});

router.post('/:id/deposit', async (req, res, next) => {
  try {
    const schema = z.object({
      amount: z.number().int().positive(),
      currency: z.string().length(3).default('VND')
    });
    const { amount, currency } = schema.parse(req.body);
    const idem = req.get('Idempotency-Key');
    if (!idem) return res.status(428).json({ message: 'Idempotency-Key required' });

    // chỉ cho nạp vào tài khoản của chính mình
    const acct = await db.Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!acct) return res.status(404).json({ message: 'Account not found' });
    if (acct.status !== 'ACTIVE') return res.status(400).json({ message: 'Account not active' });
    if (acct.currency !== currency) return res.status(400).json({ message: 'Currency mismatch' });

    // Treasury → User
    const treasury = await getOrCreateTreasuryAccount();

    const tr = await createTransfer({
      fromAccountId: treasury.id,
      toAccountId: acct.id,
      amount,
      currency,
      idempotencyKey: idem,
      actor: req.user.id
    });

    return res.status(201).json({ id: tr.id, status: tr.status });
  } catch (e) { next(e); }
});

// ===== RÚT TIỀN =====
router.post('/:id/withdraw', async (req, res, next) => {
  try {
    const schema = z.object({
      amount: z.number().int().positive(),
      currency: z.string().length(3).default('VND')
    });
    const { amount, currency } = schema.parse(req.body);
    const idem = req.get('Idempotency-Key');
    if (!idem) return res.status(428).json({ message: 'Idempotency-Key required' });

    // chỉ cho rút từ tài khoản của chính mình
    const acct = await db.Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!acct) return res.status(404).json({ message: 'Account not found' });
    if (acct.status !== 'ACTIVE') return res.status(400).json({ message: 'Account not active' });
    if (acct.currency !== currency) return res.status(400).json({ message: 'Currency mismatch' });

    // User → Treasury
    const treasury = await getOrCreateTreasuryAccount();

    const tr = await createTransfer({
      fromAccountId: acct.id,
      toAccountId: treasury.id,
      amount,
      currency,
      idempotencyKey: idem,
      actor: req.user.id
    });

    return res.status(201).json({ id: tr.id, status: tr.status });
  } catch (e) { next(e); }
});

export default router;
