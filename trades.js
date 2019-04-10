const model = require('./model');
var Trade = model.Trade;
module.exports = {
    getTrades: () => {
        return Trade.findAll();
    },

    getTrade: (id) => {
        return Trade.findAll({
            where: {
                id: id
            }
        });
    },

    createTrade: (name, code, price) => {
        return Trade.create({
            code: code,
            name: name,
            price: price,
            shares: 200,
        });
    },

    deleteTrade: (id) => {
        return Trade.destroy({
            where: {
                id: id
            }
        });;
    }
};
