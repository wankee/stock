import { Sequelize, DataTypes } from 'sequelize';
import config = require('./config');

const uuidv4 = require('uuid/v4');
// console.log('init sequelize...');
function generateId() {
    return uuidv4();
}
export var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    define: { charset: 'utf8' },
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

const ID_TYPE = DataTypes.STRING(50);

export function defineModel(name, attributes) {
    var attrs: any = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    attrs.id = {
        type: ID_TYPE,
        primaryKey: true
    };
    attrs.createdAt = {
        type: DataTypes.BIGINT,
        allowNull: false
    };
    attrs.updatedAt = {
        type: DataTypes.BIGINT,
        allowNull: false
    };
    // printModel(name,attrs);
    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        collate: 'utf8_general_ci',
        hooks: {
            beforeValidate: function (obj: any) {
                let now = Date.now();
                if (obj.isNewRecord) {
                    console.log('will create entity...' + obj);
                    if (!obj.id) {
                        obj.id = generateId();
                    }
                    obj.createdAt = now;
                    obj.updatedAt = now;
                } else {
                    console.log('will update entity...');
                    obj.updatedAt = now;
                }
            }
        }
    });
}

export function sync(success, error) {
    // only allow create ddl in non-production environment:
    if (process.env.NODE_ENV !== 'production') {
        sequelize.sync({ force: true }).then(success, error);
    } else {
        throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
    }
}