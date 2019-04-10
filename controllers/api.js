const trades = require('../trades');
const APIError = require('../rest').APIError;

module.exports = {
    'GET /api/trades': async (ctx, next) => {
        ctx.rest({
            trades: await trades.getTrades()
        });
    },

    'POST /api/trades': async (ctx, next) => {
        ctx.rest(
            await trades.createTrade(ctx.request.body.name, ctx.request.body.code, parseFloat(ctx.request.body.price))
        );
    },

    'DELETE /api/trades/:id': async (ctx, next) => {
        console.log(`delete trade ${ctx.params.id}...`);
        if (await trades.deleteTrade(ctx.params.id)) {
            ctx.rest({
                id: ctx.params.id
            });
        } else {
            throw new APIError('trade:not_found', 'trade not found by id.');
        }
    }
};
