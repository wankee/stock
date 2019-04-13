import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export default class Trade extends Model { }

Trade.init({
    code: DataTypes.STRING(6),
    name: DataTypes.STRING(10),
    price: DataTypes.DECIMAL(12, 2),
    shares: DataTypes.INTEGER,
}, { sequelize, modelName: 'trade', freezeTableName: true })