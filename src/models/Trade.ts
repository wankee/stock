import db = require('../db');
export = db.defineModel('trade', {
    code: db.STRING(6),
    name: db.STRING(10),
    price: db.DECIMAL(12, 2),
    shares: db.INTEGER,
});