import { Moment } from "moment";
import moment = require("moment");
import fs = require('fs');

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
                let lines = fs.readFileSync(__dirname + '/../data/holidays/' + mo.year() + '.txt', 'utf8').split('\n');
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
        let lines = fs.readFileSync(__dirname + '/../data/dayhot/popular.txt', 'utf8').split('\n');

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
}