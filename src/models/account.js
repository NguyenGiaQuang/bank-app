import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Account extends Model {}
  Account.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    userId: { type: DataTypes.UUID, allowNull: false },
    number: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'VND' },
    balance: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 }, // cache hiển thị
    status: { type: DataTypes.ENUM('ACTIVE','FROZEN'), allowNull: false, defaultValue: 'ACTIVE' }
  }, { sequelize, tableName: 'accounts' });
  return Account;
};
