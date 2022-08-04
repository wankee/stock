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

    /** 获取前一个交易日期 */
    public static findTradeDay(date: string, mode: string): string {
        let mo = Utils.shortDay(date);
        let year = mo.year();

        if (mode === 'next') {
            mo.add(1, 'days');
        } else {
            mo.subtract(1, 'days');
        }

        // console.log('--------------');
        // console.log(pre);

        let isHoliday = false;

        if (mo.isoWeekday() === 6 || mo.isoWeekday() === 7) {
            isHoliday = true;
        } else {
            try {
                let lines = fs.readFileSync(__dirname + '/../data/holidays/' + year + '.txt', 'utf8').split('\n');
                // console.log(lines);

                for (let i = 0; i < lines.length; i++) {
                    let str = lines[i].split(' ');
                    if (mo.isSame(str[0], 'day')) {
                        isHoliday = true;
                        // console.log(str);
                        // console.log('is holiday');
                        break;
                    }
                }
            } catch (err) {
                console.log("Error:" + err);
            }
        }

        if (isHoliday) {
            return Utils.findTradeDay(Utils.shortDayStr(mo), mode);
        } else {
            return Utils.shortDayStr(mo);
        }
    };

    public static preTradeDay(date: string): string {
        return this.findTradeDay(date, 'pre')
    }

    public static nextTradeDay(date: string): string {
        return this.findTradeDay(date, 'next');
    }
}