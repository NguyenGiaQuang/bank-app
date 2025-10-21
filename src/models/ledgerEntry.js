import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class LedgerEntry extends Model {}
  LedgerEntry.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    transferId: { type: DataTypes.UUID, allowNull: false },
    accountId: { type: DataTypes.UUID, allowNull: false },
    type: { type: DataTypes.ENUM('DEBIT','CREDIT'), allowNull: false },
    amount: { type: DataTypes.BIGINT, allowNull: false }
  }, { sequelize, tableName: 'ledger_entries' });
  return LedgerEntry;
};
