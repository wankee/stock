import db = require('../db');
export = db.defineModel('fund', {
    date: db.DATEONLY,
    amount: db.DECIMAL(12, 2),
    type: db.STRING(6),
});