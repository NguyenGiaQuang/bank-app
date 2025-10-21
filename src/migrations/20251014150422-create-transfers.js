'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('transfers', {
      id: { type: S.UUID, primaryKey: true, allowNull: false },
      fromAccountId: { type: S.UUID, allowNull: false },
      toAccountId: { type: S.UUID, allowNull: false },
      amount: { type: S.BIGINT, allowNull: false },
      currency: { type: S.STRING(3), allowNull: false, defaultValue: 'VND' },
      idempotencyKey: { type: S.STRING(64), allowNull: false, unique: true },
      status: { type: S.ENUM('PENDING','COMPLETED','FAILED'), defaultValue: 'PENDING' },
      metadata: { type: S.JSONB },
      createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }
    });
    await q.addIndex('transfers', ['fromAccountId']);
    await q.addIndex('transfers', ['toAccountId']);
  },
  async down(q) { await q.dropTable('transfers'); }
};
