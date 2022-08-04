import rest = require('../rest');
import Trade from '../models/Trade';
import Fund from '../models/Fund';
import Utils from '../utils';
import fs = require('fs');
import moment = require('moment');

const axios = require('axios');

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
        let response = { "code": 0, "message": "success", "data": {} };
        try {
            let start = '20220801';
            let res = new Array();

            // let files=fs.readdirSync(__dirname + '/../../data/pop3');
            fs.readdirSync(__dirname + '/../../data/pop3')
                .filter((f: string) => {
                    return f.endsWith('.txt');
                })
                .forEach((f: string) => {
                    console.log('file:' + f);
                    let data = JSON.parse(fs.readFileSync(__dirname + '/../../data/pop3/' + f, 'utf8'));
                    let open = data.open;
                    let close = data.close;
                    let high = data.high;
                    let low = data.low;
                    let item = [Utils.shortDay(data.date).hour(15).valueOf(), open, high, low, close, 100000];
                    res.push(item);
                });

            response.data = res;
        } catch (err) {
            console.error(err);
        };

        ctx.rest(
            response
        );
    },
};
