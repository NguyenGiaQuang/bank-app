'use strict';
const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');

module.exports = {
  async up(q) {
    const userId = uuid();
    const pw = await bcrypt.hash('Secret123!', 10);
    await q.bulkInsert('users', [{
      id: userId, email: 'alice@example.com', name: 'Alice',
      passwordHash: pw, is2FAEnabled: false, createdAt: new Date(), updatedAt: new Date()
    }]);

    await q.bulkInsert('accounts', [
      { id: uuid(), userId, number: '100000001', currency: 'VND', balance: 5000000, status:'ACTIVE', createdAt:new Date(), updatedAt:new Date() },
      { id: uuid(), userId, number: '100000002', currency: 'VND', balance: 3000000, status:'ACTIVE', createdAt:new Date(), updatedAt:new Date() }
    ]);
  },
  async down(q) {
    await q.bulkDelete('accounts', null, {});
    await q.bulkDelete('users', { email: 'alice@example.com' }, {});
  }
};
