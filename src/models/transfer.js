import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Transfer extends Model {}
  Transfer.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    fromAccountId: { type: DataTypes.UUID, allowNull: false },
    toAccountId: { type: DataTypes.UUID, allowNull: false },
    amount: { type: DataTypes.BIGINT, allowNull: false },
    currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'VND' },
    idempotencyKey: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    status: { type: DataTypes.ENUM('PENDING','COMPLETED','FAILED'), defaultValue: 'PENDING' },
    metadata: { type: DataTypes.JSONB }
  }, { sequelize, tableName: 'transfers' });
  return Transfer;
};
