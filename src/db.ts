import { Sequelize, DataTypes } from 'sequelize';

const uuidv4 = require('uuid/v4');

import config = require('./config');

// console.log('init sequelize...');
function generateId() {
    return uuidv4();
}

var sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    define: { charset: 'utf8' },
    dialectOptions: { collate: 'utf8_general_ci' },
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
});

const ID_TYPE = DataTypes.STRING(50);

function printModel(name, attrs) {
    console.log('model defined for table: ' + name + '\n' + JSON.stringify(attrs, function (k, v) {
        if (k === 'type') {
            for (let key in Sequelize) {
                if (key === 'ABSTRACT' || key === 'NUMBER') {
                    continue;
                }
                let dbType = Sequelize[key];
                if (typeof dbType === 'function') {
                    if (v instanceof dbType) {
                        if (v._length) {
                            return `${dbType.key}(${v._length})`;
                        }
                        return dbType.key;
                    }
                    if (v === dbType) {
                        return dbType.key;
                    }
                }
            }
        }
        return v;
    }, '  '));
}
function defineModel(name, attributes) {
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
        hooks: {
            beforeValidate: function (obj:any) {
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


const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN', 'DECIMAL'];

var exp: any = {
    defineModel: defineModel,
    // sync: () => {
    //     // sync(null, null);
    //     // only allow create ddl in non-production environment:
    //     if (process.env.NODE_ENV !== 'production') {
    //         sequelize.sync({ force: true });
    //     } else {
    //         throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
    //     }
    // },
    sync: (success, error) => {
        // only allow create ddl in non-production environment:
        if (process.env.NODE_ENV !== 'production') {
            sequelize.sync({ force: true }).then(success, error);
        } else {
            throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        }
    }
};

for (let type of TYPES) {
    exp[type] = Sequelize[type];
}

exp.ID = ID_TYPE;
exp.generateId = generateId;

// export class db extends Sequelize{}
// module.exports = exp;
export = exp;