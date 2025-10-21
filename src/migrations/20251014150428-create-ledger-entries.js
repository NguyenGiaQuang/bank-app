'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('ledger_entries', {
      id: { type: S.UUID, primaryKey: true, allowNull: false },
      transferId: { type: S.UUID, allowNull: false },
      accountId: { type: S.UUID, allowNull: false },
      type: { type: S.ENUM('DEBIT','CREDIT'), allowNull: false },
      amount: { type: S.BIGINT, allowNull: false },
      createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }
    });
    await q.addIndex('ledger_entries', ['transferId']);
    await q.addIndex('ledger_entries', ['accountId']);
  },
  async down(q) { await q.dropTable('ledger_entries'); }
};
