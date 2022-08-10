import { Moment } from "moment";
import moment = require("moment");
import fs = require('fs');
import path = require("path")

export default class Utils {

    public static getObjectClass(obj): any {
        if (obj && obj.constructor && obj.constructor.toString) {
            var arr = obj.constructor.toString().match(/function\s*(\w+)/);
            if (arr && arr.length == 2) {
                return arr[1];
            }
        }

        return undefined;
    };

    /**
     * 将string或者number转化成Moment
     * @param date 
     * @returns Moment
     */
    public static shortDay(date: string | number): Moment {
        return moment(date, 'YYYYMMDD');
    };

    /**
     * 将moment转化成string
     * @param moment 
     * @returns 
     */
    public static shortDayStr(moment: Moment): string {
        return moment.format('YYYYMMDD');
    };

    public static isTradingDay(date: string | Moment): boolean {
        let mo: Moment;

        if (typeof (date) === 'string') {
            mo = Utils.shortDay(date);
        } else {
            mo = date;
        }

        let isOpen = true;
        if (mo.isoWeekday() === 6 || mo.isoWeekday() === 7) {
            isOpen = false;
        } else {
            try {
                let lines = fs.readFileSync(appRoot + '/data/holidays/' + mo.year() + '.txt', 'utf8').split('\n');
                // console.log(lines);

                for (let i = 0; i < lines.length; i++) {
                    let str = lines[i].split(' ');
                    if (mo.isSame(str[0], 'day')) {
                        isOpen = false;
                        // console.log(str);
                        // console.log('is holiday');
                        break;
                    }
                }
            } catch (err) {
                console.log("isTradingDay Error:" + err);
            }
        }
        return isOpen;
    }


    /** 获取前一个交易日期 */
    public static preTradeDay(date: string): string {
        let preDay = Utils.shortDay(date).subtract(1, 'days');
        // console.log('--------------');
        // console.log(pre);
        let dateStr = Utils.shortDayStr(preDay);

        if (this.isTradingDay(dateStr)) {
            return dateStr;
        } else {
            return Utils.preTradeDay(dateStr);

        }
    }

    public static nextTradeDay(date: string): string {
        let nextDay = Utils.shortDay(date).add(1, 'days');
        // console.log('--------------');
        // console.log(pre);

        let dateStr = Utils.shortDayStr(nextDay);

        if (this.isTradingDay(dateStr)) {
            return dateStr;
        } else {
            return Utils.nextTradeDay(dateStr);
        }
    }

    public static getDayPopStocks(latestDate: string) {
        let stocks = null;
        let lines = fs.readFileSync(appRoot + '/data/dayhot/popular.txt', 'utf8').split('\n');

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line === null || line.length === 0) continue;

            let el = lines[i].split(':');
            let time = el[0];
            let date = time.substring(0, 8);
            if (latestDate !== date) continue;

            let mom = moment(time, 'YYYYMMDDHHmmss');
            if (mom.format('HHmmss') === '143000') {
                stocks = JSON.parse(el[1]);
            }
        }
        if (stocks == null) return new Array();
        return stocks;
    }

    public static getCode(stockId: string): string {
        let code = stockId;
        if (stockId.startsWith('60')) {
            code = 'sh' + stockId;
        } else {
            code = 'sz' + stockId;
        }
        return code;
    }

    public static generatePopIndex(latestDate: string, preClose: number) {
        let preDate = Utils.preTradeDay(latestDate);
        console.log("Previous trade date:" + preDate + " preClose:" + preClose);

        let stocks = Utils.getDayPopStocks(preDate);
        if (stocks === null || stocks.length === 0) {
            console.log('No pop stocks!');
            return null;
        }
        // console.log(stocks);

        let max = 3;
        let count = stocks.length >= max ? max : stocks.length;

        let res = {
            "date": latestDate, "preClose": preClose, "open": 0, "high": 0, "low": 0, "close": 0,
            "highTime": '0930', "lowTime": '0930', "trend": []
        };

        for (let j = 0; j < count; j++) {
            // console.log('j:' + j);
            let stock = stocks[j];
            console.log(stock);

            let fileName = path.join(appRoot, '/fetched/trend/', stock[1], '/', latestDate + '.txt');
            console.log(fileName);

            // console.log('before read==>' + moment().valueOf());
            let trendsData;

            try {
                trendsData = fs.readFileSync(fileName, 'utf8');
            } catch (err) {
                console.log('Get trends data data error:' + err);
                return null;
            }
            // console.log('after read==>' + moment().valueOf());

            console.log('=====>' + stock[1] + ' ' + latestDate);

            let code = Utils.getCode(stock[1]);
            let obj = JSON.parse(trendsData).data[code];
            let treObj = obj.data.data;

            console.log('Trend size:' + treObj.length);
            if (treObj.length !== 242 && treObj.length !== 267) {
                console.log(trendsData);
            }

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

            let maxLength = 242;
            for (let k = 0; k < maxLength; k++) {
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

                if (k < 2 || k > maxLength - 3) {
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
}