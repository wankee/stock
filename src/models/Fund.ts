import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export default class Fund extends Model { }

Fund.init({
    date: DataTypes.DATEONLY,
    amount: DataTypes.DECIMAL(12, 2),
    type: DataTypes.STRING(6),
}, { sequelize, modelName: 'fund', freezeTableName: true })