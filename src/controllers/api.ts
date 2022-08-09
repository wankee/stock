import rest = require('../rest');
import Trade from '../models/Trade';
import Fund from '../models/Fund';
import Utils from '../utils';
import fs = require('fs');
import moment = require('moment');
// const router = require('koa-router')();
const send = require('koa-send');
const axios = require('axios');
const path = require("path")

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

function generateData(latestDate: string) {
    console.log('--Generate date:' + latestDate);

    let preDate = Utils.preTradeDay(latestDate);
    console.log("Previous trade date:" + preDate);

    let stocks = Utils.getDayPopStocks(preDate);
    if (stocks === null || stocks.length === 0) return null;
    // console.log(stocks);

    let max = 3;
    let count = stocks.length >= max ? max : stocks.length;
    let preClose = 1000;

    try {
        let preData = JSON.parse(fs.readFileSync(__dirname + '/../data/pop3/' + preDate + '.txt', 'utf8'));
        if (preData !== null && preData.close !== null) {
            preClose = parseFloat(preData.close);
        }
    } catch (err) {
        console.log('Get pre data error:' + err);
    }

    console.log("preClose:" + preClose);

    let res = {
        "date": latestDate, "preClose": preClose, "open": 0, "high": 0, "low": 0, "close": 0,
        "highTime": '0930', "lowTime": '0930', "trend": []
    };

    for (let j = 0; j < count; j++) {
        // console.log('j:' + j);
        let stock = stocks[j];
        console.log(stock);

        let fileName = path.join(__dirname, '/../../fetched/trend/', stock[1], '/', latestDate + '.txt');
        console.log(fileName);

        // console.log('before read==>' + moment().valueOf());
        let trendsData;
        try {
            trendsData = fs.readFileSync(fileName, 'utf8');
        } catch (err) {
            console.log('Get trends data data error:' + err);
            return null;
            // continue;
        }
        // console.log(trendsData.length);
        // console.log('after read==>' + moment().valueOf());
        console.log('=====>' + stock[1] + ' ' + latestDate);

        let code = Utils.getCode(stock[1]);
        let obj = JSON.parse(trendsData).data[code];
        let treObj = obj.data.data;
        // console.log(treObj);
        let info = obj.qt[code];
        console.log(info[0] + ' ' + info[1] + ' ' + info[2]
            + ' ' + info[3] + ' ' + info[4] + ' ' + info[5]);

        let preClose = info[4];
        let open = info[5];
        let close = info[3]
        let openPercent = 0;
        let closePercent = 0;

        let indexTrends = new Array();
        let preSum = 0;
        let indexPreClose = res.preClose / count;
        let indexOpen = indexPreClose;
        let indexHigh = indexPreClose;
        let indexLow = indexPreClose;
        let indexClose = indexPreClose * close / preClose;
        let indexHighTime = '';
        let indexLowTime = '';

        for (let k = 0; k < treObj.length; k++) {
            if (j > 0) preSum = res.trend[k][1];

            let tpdata = treObj[k].split(' ');
            let time = tpdata[0];
            let price = tpdata[1]
            let curPrice = indexPreClose * price / preClose
            let indexPrice = preSum + curPrice;

            if (k === 0) {
                indexOpen = indexPrice;
                indexHigh = indexPrice;
                indexLow = indexPrice;
                indexHighTime = time;
                indexLowTime = time;
            } else {
                if (indexPrice > indexHigh) {
                    indexHigh = indexPrice;
                    indexHighTime = time;
                }
                if (indexPrice < indexLow) {
                    indexLow = indexPrice;
                    indexLowTime = time;
                }
            }

            indexClose = indexPrice;

            indexTrends.push([time, indexPrice]);

            if (k < 2 || k > treObj.length - 3) {
                console.log(tpdata);
                console.log('currentPrice:' + curPrice + ' preSum:' + preSum + ' indexPrice:' + indexPrice);
                console.log(indexTrends[k]);
                console.log('------------');

            }
        }
        console.log('open:' + indexOpen + ' high:' + indexHigh + ' low:' + indexLow + ' close:' + indexClose);
        console.log('highTime:' + indexHighTime + ' lowTime:' + indexLowTime);

        res.trend = indexTrends;
        res.open = parseFloat(indexOpen.toFixed(2));
        res.high = parseFloat(indexHigh.toFixed(2));
        res.low = parseFloat(indexLow.toFixed(2));
        res.close = parseFloat(indexClose.toFixed(2));
        res.highTime = indexHighTime;
        res.lowTime = indexLowTime;
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

    'GET /downloadpop': async (ctx, next) => {
        let path = 'data/dayhot/popular.txt';
        ctx.attachment(path);
        await send(ctx, path);
    },

    'GET /api/thsdayhot': async (ctx, next) => {
        console.log(ctx.query.pop);
        console.log(ctx.querystring);

        let response = { "code": 0, "message": "success", "data": {} };
        try {
            let res = new Array();

            // let files=fs.readdirSync(__dirname + '/../../data/pop3');
            let cur = moment().valueOf();
            console.log('before get thsdayhot:' + cur);
            fs.readdirSync(__dirname + '/../../data/pop3')
                .filter((f: string) => {
                    return f.endsWith('.txt');
                })
                .forEach((f: string) => {
                    // console.log('file:' + f);
                    let data = JSON.parse(fs.readFileSync(__dirname + '/../../data/pop3/' + f, 'utf8'));
                    let open = data.open;
                    let close = data.close;
                    let high = data.high;
                    let low = data.low;
                    let item = [Utils.shortDay(data.date).hour(15).valueOf(), open, high, low, close, 100000];
                    res.push(item);
                });
            console.log('end get thsdayhot, used time:' + (moment().valueOf() - cur));

            response.data = res;
        } catch (err) {
            console.error(err);
        };

        ctx.rest(
            response
        );
    },

    'GET /api/backtest': async (ctx, next) => {
        console.log(ctx.query.pop);
        console.log(ctx.querystring);

        let response = { "code": 0, "message": "success", "data": {} };
        try {
            let res = new Array();
            let cur = moment().valueOf();
            let now = moment();
            for (let start = Utils.shortDay('20220801').hour(15); start.isBefore(now, 'day'); start.add(1, 'days')) {
                console.log(start);
                let data = generateData(Utils.shortDayStr(start));
                if (data !== null) {
                    let open = data.open;
                    let close = data.close;
                    let high = data.high;
                    let low = data.low;
                    let item = [start.valueOf(), open, high, low, close, 100000];
                    res.push(item);
                }
            }
            console.log('end get thsdayhot, used time:' + (moment().valueOf() - cur));

            response.data = res;
        } catch (err) {
            console.error(err);
        };

        ctx.rest(
            response
        );
    },
};
