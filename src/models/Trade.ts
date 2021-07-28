import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export default class Trade extends Model { }

Trade.init({
    date: DataTypes.DATEONLY,
    code: DataTypes.INTEGER({ length: 6, zerofill: true }),
    name: DataTypes.STRING(10),
    price: DataTypes.DECIMAL(12, 2),
    shares: DataTypes.INTEGER,
    total_price: DataTypes.DECIMAL(12, 2),
    total_fee: DataTypes.DECIMAL(12, 2),
    commission: DataTypes.DECIMAL(12, 2),
    fees: DataTypes.DECIMAL(12, 2),
    stamp_duty: DataTypes.DECIMAL(12, 2),
    transfer_tax: DataTypes.DECIMAL(12, 2),
    dividend_tax: DataTypes.DECIMAL(12, 2),
    dividend: DataTypes.DECIMAL(12, 2),
    sum: DataTypes.DECIMAL(12, 2),
}, {
    sequelize,
    modelName: 'trade',
    freezeTableName: true,
    timestamps: false,
    hooks: {
        beforeValidate: (instance: any, options) => {
            // console.log("++++===beforeValidate===");
            // console.log(instance.get());
            for (let key in instance.get()) {
                if (key === 'code' || key === 'name' || key === 'sumF') continue;
                // console.log(key);
                if (instance.get(key) === '') {
                    instance.set(key, null);
                }
            }
        },
    }
})