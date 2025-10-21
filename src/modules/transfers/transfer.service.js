// src/modules/transfers/transfer.service.js
import db from '../../models/index.js';
import { Op } from 'sequelize';

export async function createTransfer({ fromAccountId, toAccountId, amount, currency, idempotencyKey, actor }) {
  const t = await db.sequelize.transaction({ isolationLevel: db.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE });
  try {
    const existed = await db.Transfer.findOne({ where: { idempotencyKey }, transaction: t, lock: t.LOCK.KEY_SHARE });
    if (existed) { await t.commit(); return existed; }

    const [aId, bId] = [fromAccountId, toAccountId].sort();
    const accounts = await db.Account.findAll({ where: { id: { [Op.in]: [aId, bId] } }, transaction: t, lock: t.LOCK.UPDATE });

    const from = accounts.find(a => a.id === fromAccountId);
    const to = accounts.find(a => a.id === toAccountId);
    if (!from || !to) throw new Error('Account not found');
    if (from.currency !== to.currency || from.currency !== currency) throw new Error('Currency mismatch');
    if (amount <= 0) throw new Error('Invalid amount');
    if (from.status !== 'ACTIVE' || to.status !== 'ACTIVE') throw new Error('Account not active');
    if (Number(from.balance) < amount) throw new Error('Insufficient funds');

    const transfer = await db.Transfer.create({ fromAccountId, toAccountId, amount, currency, idempotencyKey, status: 'PENDING', metadata:{ actor } }, { transaction: t });

    await db.LedgerEntry.bulkCreate([
      { transferId: transfer.id, accountId: toAccountId,   type: 'DEBIT',  amount },
      { transferId: transfer.id, accountId: fromAccountId, type: 'CREDIT', amount }
    ], { transaction: t });

    from.balance = Number(from.balance) - amount;
    to.balance   = Number(to.balance)   + amount;
    await from.save({ transaction: t });
    await to.save({ transaction: t });

    transfer.status = 'COMPLETED';
    await transfer.save({ transaction: t });

    await t.commit();
    return transfer;
  } catch (e) {
    await t.rollback();
    throw e;
  }
}
