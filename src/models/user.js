import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';

export default (sequelize) => {
  class User extends Model {
    async checkPassword(pw) { return bcrypt.compare(pw, this.passwordHash); }
  }

  User.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    name: { type: DataTypes.STRING, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    twoFASecret: { type: DataTypes.STRING, allowNull: true },
    is2FAEnabled: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, { sequelize, tableName: 'users' });

  return User;
};
