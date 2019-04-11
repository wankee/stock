import db = require('../db');
module.exports = db.defineModel('fund', {
    date: db.DATEONLY,
    amount: db.DECIMAL(12, 2),
    type: db.STRING(6),
});