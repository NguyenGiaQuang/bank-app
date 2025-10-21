// src/modules/accounts/account.service.js
import db from '../../models/index.js';

export async function getOrCreateTreasuryAccount() {
  // Tạo hoặc lấy user hệ thống
  const [systemUser] = await db.User.findOrCreate({
    where: { email: 'system@bank.local' },
    defaults: {
      name: 'System',
      passwordHash: '$2b$10$CqkCqkCqkCqkCqkCqkCqkO1u0Yk4cTg0wqH5oE1vR1jVhJdYqQhQ2' // dummy
    }
  });

  // Tạo hoặc lấy account TREASURY (VND)
  const [treasury] = await db.Account.findOrCreate({
    where: { number: 'TREASURY' },
    defaults: {
      userId: systemUser.id,
      currency: 'VND',
      balance: 0,
      status: 'ACTIVE'
    }
  });

  return treasury;
}
