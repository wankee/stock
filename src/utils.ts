import { Moment } from "moment";
import moment = require("moment");

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
}