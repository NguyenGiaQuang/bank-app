'use strict';
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import process from 'process';
import configRaw from '../config/config.js';

const basename = path.basename(new URL(import.meta.url).pathname);
const env = process.env.NODE_ENV || 'development';
const config = configRaw[env];

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

const files = fs.readdirSync(path.resolve('src/models'))
  .filter(f => f.indexOf('.') !== 0 && f !== 'index.js');

for (const file of files) {
  const model = (await import(`./${file}`)).default(sequelize);
  db[model.name] = model;
}

// Associations
const { User, Account, Transfer, LedgerEntry } = db;

User.hasMany(Account, { foreignKey: 'userId' });
Account.belongsTo(User, { foreignKey: 'userId' });

Transfer.belongsTo(Account, { as: 'fromAccount', foreignKey: 'fromAccountId' });
Transfer.belongsTo(Account, { as: 'toAccount', foreignKey: 'toAccountId' });

LedgerEntry.belongsTo(Transfer, { foreignKey: 'transferId' });
LedgerEntry.belongsTo(Account, { foreignKey: 'accountId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
