import db = require('../db');
module.exports = db.defineModel('fund', {
    type: db.STRING(10),
    amount: db.DECIMAL(12, 2),
    time: db.BIGINT,
});