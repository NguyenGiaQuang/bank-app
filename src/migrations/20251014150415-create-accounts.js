'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('accounts', {
      id: { type: S.UUID, primaryKey: true, allowNull: false },
      userId: { type: S.UUID, allowNull: false },
      number: { type: S.STRING(20), allowNull: false, unique: true },
      currency: { type: S.STRING(3), allowNull: false, defaultValue: 'VND' },
      balance: { type: S.BIGINT, allowNull: false, defaultValue: 0 },
      status: { type: S.ENUM('ACTIVE','FROZEN'), allowNull: false, defaultValue: 'ACTIVE' },
      createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }
    });
    await q.addIndex('accounts', ['userId']);
  },
  async down(q) {
    await q.dropTable('accounts');
  }
};
