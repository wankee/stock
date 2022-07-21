import rest = require('../rest');
import Trade from '../models/Trade';
import Fund from '../models/Fund';
import Utils from '../utils';
import fs = require('fs');

function getFundHistory() {
    return Fund.findAll({
        attributes: ['date', 'amount', 'type'],
        order: [['date', 'ASC']]
    });
}

function getTrades() {
    return Trade.findAll({
        attributes: ['id', 'date', 'code', 'name', 'price', 'shares', 'balance'],
        order: [['date', 'DESC']]
    });
}
function getTrade(id) {
    return Trade.findAll({
        where: {
            id: id
        }
    });
}
function createTrade(trade) {
    return Trade.create({
        date: trade.date,
        code: trade.code,
        name: trade.name,
        price: trade.price,
        shares: trade.shares,
        total_price: trade.total_price,
        total_fee: trade.total_fee,
        commission: trade.commission,
        fees: trade.fees,
        stamp_duty: trade.stamp_duty,
        transfer_tax: trade.transfer_tax,
        dividend_tax: trade.dividend_tax,
        dividend: trade.dividend,
        balance: trade.balance,
    });
}
function deleteTrade(id) {
    return Trade.destroy({
        where: {
            id: id
        }
    });
}

function parseFundHistory(fundHitory: any) {
    let res = new Array();
    for (let row of fundHitory) {
        res.push([
            new Date(row.date).getTime(),
            parseFloat(row.amount),
            row.type
        ]);
    }
    return res;
}

module.exports = {
    'GET /api/fund_history': async (ctx, next) => {
        ctx.rest(
            parseFundHistory(await getFundHistory())
        );
    },

    'GET /api/trades_fund_history': async (ctx, next) => {
        ctx.rest({
            trades: await getTrades(),
            fund: parseFundHistory(await getFundHistory())
        });
    },

    'GET /api/trades': async (ctx, next) => {
        ctx.rest({
            trades: await getTrades()
        });
    },

    'POST /api/trades': async (ctx, next) => {
        // console.log(ctx.request.body);
        ctx.rest(
            await createTrade(ctx.request.body)
        );
    },

    'DELETE /api/trades/:id': async (ctx, next) => {
        console.log(`delete trade ${ctx.params.id}...`);
        if (await deleteTrade(ctx.params.id)) {
            ctx.rest({
                id: ctx.params.id
            });
        } else {
            throw new rest.APIError('trade:not_found', 'trade not found by id.');
        }
    },

    'GET /api/thsdayhot': async (ctx, next) => {
        let response = { "status_code": 0, "status_msg": "success", "data": {} };
        try {
            let lines = fs.readFileSync(__dirname + '/../../data/dayhot.txt', 'utf8').split('\n');
            let res = new Array();
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                if (line === null || line.length === 0) continue;

                let el = lines[i].split(':');
                let item = [parseInt(el[0]), JSON.parse(el[1])];
                
                res.push(item);
            }
            response.data = res;
        } catch (err) {
            console.error(err);
        };

        ctx.rest(
            response
        );
    },
};
