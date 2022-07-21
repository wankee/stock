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
            let lines = fs.readFileSync(__dirname + '/../../data/dayhot.txt', 'utf8').split('\n');
            let res = new Array();
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                if (line === null || line.length === 0) continue;

                let el = lines[i].split(':');
                let time = el[0];
                let date = el[0].substring(0, 8);
                let stocks = JSON.parse(el[1]);

                let max = 3;
                let count = stocks.length >= max ? max : stocks.length;

                let requests = new Array();
                for (let j = 0; j < count; j++) {
                    let stock = stocks[j];

                    let param = new URLSearchParams();
                    param.append('Day', date);
                    param.append('StockID', stock[1]);
                    param.append('a', 'GetStockTrend');
                    param.append('c', 'StockL2History');
                    // data.append('DeviceID', '3f5e28db1fbb51605ea65a9db9cfdb1054295463');
                    // data.append('PhoneOSNew', '2');
                    // data.append('Token', '0');
                    // data.append('UserID', '0');
                    // data.append('VerSion', '5.6.0.3');
                    // data.append('apiv', 'w30');
                    requests.push(axios.post('https://apphis.longhuvip.com/w1/api/index.php', param, {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    }));
                }

                await axios.all(requests).then(results => {

                    let openPercent = 0;
                    let closePercent = 0;

                    for (let k = 0; k < results.length; k++) {
                        let result = results[k];
                        if (result.status === 200 && result.data !== null) {
                            let trends = result.data;

                            if (trends.trend) {
                                console.log('===>' + trends.day + ' ' + trends.code + '\nopen:' + trends.begin_px + ' preclose:' + trends.preclose_px);
                                let op = trends.begin_px / trends.preclose_px - 1;
                                // console.log('open percent:' + op);
                                openPercent += op;
                                // console.log('开盘涨幅:' + openPercent);


                                let trend = trends.trend;
                                // console.log('close:' + trend[trend.length - 1][1]);
                                let cp = trend[trend.length - 1][1] / trends.preclose_px - 1;
                                // console.log('close percent:' + cp);

                                closePercent += cp;
                                // console.log('收盘涨幅:' + closePercent);


                            } else {
                                console.log('Data does not exist, maybe it is holiday');
                            }
                        } else {
                            console.log('Response:' + result.status + "/" + result.statusText);
                        }
                    };
                    let open = 1000 * (1 + openPercent / results.length);
                    let close = 1000 * (1 + closePercent / results.length);
                    let high = open > close ? open : close;
                    let low = open > close ? close : open;
                    // console.log('开盘百分比：' + openPercent / results.length);
                    // console.log('收盘百分比：' + closePercent / results.length);


                    let item = [moment(date).hour(15).valueOf(), open, high, low, close, 100000];
                    // console.log(item);

                    res.push(item);

                }).catch(err => {
                    console.log(err);
                });
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
