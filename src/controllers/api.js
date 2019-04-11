const APIError = require('../rest').APIError;
const Trade = require('../model').Trade;

function getTrades() {
    return Trade.findAll();
}
function getTrade(id) {
    return Trade.findAll({
        where: {
            id: id
        }
    });
}
function createTrade(name, code, price) {
    return Trade.create({
        code: code,
        name: name,
        price: price,
        shares: 200,
    });
}
function deleteTrade(id) {
    return Trade.destroy({
        where: {
            id: id
        }
    });
}

module.exports = {
    'GET /api/trades': async (ctx, next) => {
        ctx.rest({
            trades: await getTrades()
        });
    },

    'POST /api/trades': async (ctx, next) => {
        ctx.rest(
            await createTrade(ctx.request.body.name, ctx.request.body.code, parseFloat(ctx.request.body.price))
        );
    },

    'DELETE /api/trades/:id': async (ctx, next) => {
        console.log(`delete trade ${ctx.params.id}...`);
        if (await deleteTrade(ctx.params.id)) {
            ctx.rest({
                id: ctx.params.id
            });
        } else {
            throw new APIError('trade:not_found', 'trade not found by id.');
        }
    }
};
