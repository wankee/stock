import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export default class Fund extends Model { }

Fund.init({
    date: DataTypes.DATEONLY,
    amount: DataTypes.DECIMAL(12, 2),
    type: DataTypes.STRING(6),
}, {
        sequelize,
        modelName: 'fund',
        freezeTableName: true
        // hooks: {
        //     beforeBulkCreate: (instances, options) => {
        //         // console.log("===beforeBulkCreate===")
        //         // for (let instance of instances)
        //             // console.log(instance.get())
        //     },
        //     beforeValidate: (instance: Fund, options) => {
        //         // console.log("++++===beforeValidate===")
        //         // console.log(instance.get())
        //     },
        //     beforeCreate: (instance, options) => {
        //         // console.log("===beforeCreate===")
        //         // console.log(instance.get())
        //     },
        // }
    })


