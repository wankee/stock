import Utils from '../utils';
import moment = require('moment');
import currency = require('currency.js');
const path = require("path")
const initCash = 100000;

function checkSellPosition(preData: Array<any>, date: string) {
    console.log('---selling---');

    if (preData === null || preData.length === 0) return null;
    let cash = preData[6];
    let preHolds = preData[8];
    let preTradeDetail = preData[9];
    console.log('-->cash:' + cash);

    // let preDate = Utils.preTradeDay(latestDate);
    // console.log("Previous trade date:" + preDate + " preClose:" + preClose);

    // let stocks = Utils.getDayPopStocks(preDate);
    // if (stocks === null || stocks.length === 0) {
    //     console.log('No pop stocks!');
    //     return null;
    // }
    // // console.log(stocks);

    // let max = 3;
    // let count = stocks.length >= max ? max : stocks.length;

    // let initCash = 100000;
    let res = {
        "date": date, "preClose": 1000, "open": 0, "high": 0, "low": 0,
        "close": 0, "highTime": '0930', "lowTime": '0930', "trend": [],
        "cash": cash, "hold": [], "tradeRecords": [], 'marketValue': 0
    };

    for (let j = 0; j < preHolds.length; j++) {
        //     // console.log('j:' + j);
        let preHold = preHolds[j];

        let name = preHold.name;
        let code = preHold.code;
        let amount = preHold.amount;

        let hold = {
            'code': preHold.code, 'name': preHold.name, 'aveCost': preHold.aveCost,
            'amount': preHold.amount, 'totalCost': preHold.totalCost, 'curPrice': preHold.curPrice,
            'curValue': preHold.curValue, 'balance': preHold.balance
        };
        // console.log(stock.code + ' ' + stock.name);

        // console.log('before read==>' + moment().valueOf());
        let trendsData = Utils.getStockTrends(code, date);
        if (trendsData === null) return null;
        // console.log('after read==>' + moment().valueOf());
        //     console.log('=====>' + stock[1] + ' ' + latestDate);

        let qcode = Utils.getCode(code);
        let obj = trendsData.data[qcode];
        let treObj = obj.data.data;

        // console.log('Trend size:' + treObj.length);
        //     if (treObj.length !== 242 && treObj.length !== 267) {
        //         console.log(trendsData);
        //     }

        let info = obj.qt[qcode];
        // console.log(info[0] + ' ' + info[1] + ' ' + info[2] + ' ' + info[3] + ' ' + info[4] + ' ' + info[5]);


        //     let preClose = info[4];
        //     let open = info[5];
        //     let close = info[3]
        //     let openPercent = 0;
        //     let closePercent = 0;

        //     let indexTrends = new Array();
        //     let preSum = 0;
        //     let indexPreClose = res.preClose / count;
        //     let indexOpen = indexPreClose;
        //     let indexHigh = indexPreClose;
        //     let indexLow = indexPreClose;
        //     let indexClose = indexPreClose * close / preClose;
        //     let indexHighTime = '';
        //     let indexLowTime = '';

        let maxLength = 242;
        for (let k = 0; k < maxLength; k++) {
            //         if (j > 0) preSum = res.trend[k][1];

            let tpdata = treObj[k].split(' ');
            let time = tpdata[0];
            let price = tpdata[1];

            if (time === '0930') {
                let total = currency(price).multiply(amount).value;
                res.cash += total;
                hold.amount -= amount;
                hold.totalCost = -total;
                // let avaiableCash = initCash / count;
                // let hold = { 'code': code, 'name': name, 'price': price, 'amount': amount, 'total': price * amount };
                // res.hold.push(hold);
                if (hold.amount > 0) {
                    res.hold.push(hold);
                    // res.tradeRecords.push(record);
                    // res.cash += total;
                }

                let record = {
                    'time': moment(date + time + '00', 'YYYYMMDDHHmmss').valueOf(), 'code': code,
                    'name': name, 'price': price, 'amount': -amount,
                    'total': -total, 'fee': 0
                };
                res.tradeRecords.push(record);

                console.log('--> selling:' + code + ' ' + name + ' ' + price + ' '
                    + amount + ' ' + total
                    + ' cash:' + res.cash);
                // console.log('After Selling:');
                // console.log('cash:' + cash);
                // console.log(hold);
            }

            //         if (time === '1430') {
            //             let avaiableCash = initCash / count;
            //             let amount = Math.trunc(avaiableCash / (price * 100)) * 100;
            //             let hold = { 'code': code, 'name': name, 'price': price, 'amount': amount, 'total': price * amount };
            //             res.hold.push(hold);
            //             res.cash -= price * amount;

            //             console.log('After buying:');
            //             console.log('cash:' + res.cash);
            //             console.log(hold);
            //         }

            //         let curPrice = indexPreClose * price / preClose;
            //         let indexPrice = preSum + curPrice;

            //         if (k === 0) {
            //             indexOpen = indexPrice;
            //             indexHigh = indexPrice;
            //             indexLow = indexPrice;
            //             indexHighTime = time;
            //             indexLowTime = time;
            //         } else {
            //             if (indexPrice > indexHigh) {
            //                 indexHigh = indexPrice;
            //                 indexHighTime = time;
            //             }
            //             if (indexPrice < indexLow) {
            //                 indexLow = indexPrice;
            //                 indexLowTime = time;
            //             }
            //         }

            //         indexClose = indexPrice;

            //         indexTrends.push([time, indexPrice]);

            //         // if (k < 2 || k > maxLength - 3) {
            //         //     console.log(tpdata);
            //         //     console.log('currentPrice:' + curPrice + ' preSum:' + preSum + ' indexPrice:' + indexPrice);
            //         //     console.log(indexTrends[k]);
            //         //     console.log('------------');

            //         // }
        }
        //     // console.log('open:' + indexOpen + ' high:' + indexHigh + ' low:' + indexLow + ' close:' + indexClose);
        //     // console.log('highTime:' + indexHighTime + ' lowTime:' + indexLowTime);

        //     res.trend = indexTrends;
        //     res.open = parseFloat(indexOpen.toFixed(2));
        //     res.high = parseFloat(indexHigh.toFixed(2));
        //     res.low = parseFloat(indexLow.toFixed(2));
        //     res.close = parseFloat(indexClose.toFixed(2));
        //     res.highTime = indexHighTime;
        //     res.lowTime = indexLowTime;
    }

    return res;
}

function generateData(latestDate: string, preClose: number, cash: number, initHold, initTradeRecords) {
    console.log('+++buying+++');

    let preDate = Utils.preTradeDay(latestDate);
    // console.log("Previous trade date:" + preDate + " preClose:" + preClose);

    let stocks = Utils.getDayPopStocks(preDate);
    if (stocks === null || stocks.length === 0) {
        console.log('No pop stocks!');
        return null;
    }
    // console.log(stocks);

    let max = 3;
    let count = stocks.length >= max ? max : stocks.length;

    // let initHold = [];
    // let initTradeRecords = [];
    // let cash = initCash;

    // if (sell !== null) {
    //     cash = sell.cash;
    //     initHold = sell.hold;
    //     initTradeRecords = sell.tradeRecords;
    // }

    let res = {
        "date": latestDate, "preClose": preClose, "open": 0, "high": 0, "low": 0,
        "close": 0, "highTime": '0930', "lowTime": '0930', "trend": [],
        "cash": cash, "hold": initHold, "tradeRecords": initTradeRecords, 'marketValue': 0
    };

    for (let j = 0; j < count; j++) {
        // console.log('j:' + j);
        let stock = stocks[j];
        // console.log(stock);

        // console.log('before read==>' + moment().valueOf());
        let trendsData = Utils.getStockTrends(stock[1], latestDate);
        if (trendsData === null) return null;
        // console.log('after read==>' + moment().valueOf());
        // console.log('=====>' + stock[1] + ' ' + latestDate);

        let qcode = Utils.getCode(stock[1]);
        let obj = trendsData.data[qcode];
        let treObj = obj.data.data;

        // console.log('Trend size:' + treObj.length);
        if (treObj.length !== 242 && treObj.length !== 267) {
            console.log(trendsData);
        }

        let info = obj.qt[qcode];
        // console.log(info[0] + ' ' + info[1] + ' ' + info[2] + ' ' + info[3] + ' ' + info[4] + ' ' + info[5]);

        let name = info[1];
        let code = info[2];
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

        let maxLength = 242;
        let hold = null;
        for (let k = 0; k < maxLength; k++) {
            if (j > 0) preSum = res.trend[k][1];

            let tpdata = treObj[k].split(' ');
            let time = tpdata[0];
            let price = tpdata[1];

            if (time === '1430') {
                let avaiableCash = cash / count;
                let amount = Math.trunc(avaiableCash / (price * 100)) * 100;
                let total = currency(price).multiply(amount).value;
                hold = {
                    'code': code, 'name': name, 'aveCost': price, 'amount': amount,
                    'totalCost': total, 'curPrice': price, 'curValue': total, 'balance': 0
                };

                let record = {
                    'time': moment(latestDate + time + '00', 'YYYYMMDDHHmmss').valueOf(), 'code': code, 'name': name, 'price': price, 'amount': amount,
                    'total': total, 'fee': 0
                };

                if (amount > 0) {
                    res.hold.push(hold);
                    res.tradeRecords.push(record);
                    res.cash -= total;
                }

                console.log('++> buying:' + code + ' ' + name + ' ' + price + ' '
                    + amount + ' ' + total + ' cash:' + res.cash);
                // console.log('++> buying cash:' + res.cash);
                // console.log(hold);
            }

            if (time === '1500') {
                if (hold !== null && hold.amount > 0) {
                    hold.curPrice = price;
                    hold.curValue = currency(price).multiply(hold.amount).value;
                    hold.balance = currency(hold.curValue).subtract(hold.totalCost).value;
                    res.marketValue += hold.curValue;
                }
            }

            let curPrice = indexPreClose * price / preClose;
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

            // if (k < 2 || k > maxLength - 3) {
            //     console.log(tpdata);
            //     console.log('currentPrice:' + curPrice + ' preSum:' + preSum + ' indexPrice:' + indexPrice);
            //     console.log(indexTrends[k]);
            //     console.log('------------');

            // }
        }
        // console.log('open:' + indexOpen + ' high:' + indexHigh + ' low:' + indexLow + ' close:' + indexClose);
        // console.log('highTime:' + indexHighTime + ' lowTime:' + indexLowTime);

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
    'GET /api/backtest': async (ctx, next) => {
        console.log(ctx.query.pop);
        console.log(ctx.querystring);

        let response = { "code": 0, "message": "success", "data": {} };
        try {
            let res = new Array();
            let cur = moment().valueOf();

            let now = moment();

            let preClose = 1000;
            let preData = new Array();
            for (let start = Utils.shortDay('20220801').hour(15); !start.isAfter(now, 'day'); start.add(1, 'days')) {
                // console.log(start);
                console.log('>>>>>>' + Utils.shortDayStr(start) + '<<<<<<');
                if (!Utils.isTradingDay(start)) {
                    console.log('Not trading day!');
                    continue;
                }

                // let preDate = Utils.preTradeDay(start);
                let date = Utils.shortDayStr(start);

                let sell = checkSellPosition(preData, date);

                if (sell !== null) {
                    preClose = sell.close;
                    let open = sell.open;
                    let close = sell.close;
                    let high = sell.high;
                    let low = sell.low;
                    console.log(sell.cash);
                    console.log(sell.hold);
                    console.log(sell.marketValue);
                    console.log(sell.tradeRecords);


                }

                // if (preData) {
                //     console.log('==>preData:');
                //     console.log(preData);
                // console.log('==>yestoday hold:');
                // console.log(res[res.length - 1]);
                // }
                let avaiableCash = initCash;
                let initHold = [];
                let initTradeRecords = [];
                // let cash = initCash;

                if (sell !== null) {
                    avaiableCash = sell.cash;
                    initHold = sell.hold;
                    initTradeRecords = sell.tradeRecords;
                } else if (preData !== null && preData.length > 0) {
                    avaiableCash = preData[6];
                    initHold = preData[8];
                    // initTradeRecords = preData[9];
                }

                let buy = generateData(date, preClose, avaiableCash, initHold, initTradeRecords);

                if (buy !== null) {
                    preClose = buy.close;
                    let open = buy.open;
                    let close = buy.close;
                    let high = buy.high;
                    let low = buy.low;
                    console.log(buy.cash);
                    console.log(buy.hold);
                    console.log(buy.marketValue);
                    console.log(buy.tradeRecords);

                    preData = [start.valueOf(), open, high, low, close, 99999, buy.cash, buy.marketValue, buy.hold, buy.tradeRecords];
                    res.push(JSON.parse(JSON.stringify(preData)));
                } else if (sell !== null) {
                    let item = [start.valueOf(), sell.open, sell.high, sell.low, close, 99999,
                    sell.cash, sell.marketValue, sell.hold, sell.tradeRecords];
                    res.push(item);
                }
            }
            console.log('end get thsdayhot, used time:' + (moment().valueOf() - cur));

            res.forEach(e => {
                console.log(e);

            })
            console.log(res.length);

            response.data = res;
        } catch (err) {
            console.error(err);
        };

        ctx.rest(
            response
        );
    },
};
