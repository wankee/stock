import fs = require('fs');
import moment = require('moment');
import Utils from './utils';
const axios = require('axios');
const path = require("path")
/** 保存分时数据 */
function saveTrendData(data: any, date: string, stockId: string) {
    let folder = __dirname + '/../fetched/trend/' + stockId;
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    fs.writeFileSync(folder + '/' + date + '.txt', JSON.stringify(data));
}

function fetchHistoryTrend(date: string, stockId: string) {
    let param = new URLSearchParams();
    param.append('Day', date);
    param.append('StockID', stockId);
    param.append('a', 'GetStockTrend');
    param.append('c', 'StockL2History');

    axios.post('https://apphis.longhuvip.com/w1/api/index.php', param, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }).then(response => {
        if (response.status === 200 && response.data !== null) {
            // console.log('Response:' + response.data.code);
            saveTrendData(response.data, date, stockId);

        } else {
            console.log('Response:' + response.status + "/" + response.statusText);
        }
    }).catch(error => {
        console.log('Axios fetchHistoryTrend error:' + error);
    });
}

function getCode(stockId: string): string {
    let code = stockId;
    if (stockId.startsWith('60')) {
        code = 'sh' + stockId;
    } else {
        code = 'sz' + stockId;
    }
    return code;
}
function generateTrendDataRequest(stockId: string) {
    console.log('fetch before ' + moment().valueOf());
    return axios.get('https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=' + stockId);
}

function getDayPopStocks(latestDate: string) {
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

/** 获取前一个交易日期 */
function preTradeDay(latestDate: string): string {
    let mo = Utils.shortDay(latestDate);
    let year = mo.year();

    let pre = mo.subtract(1, 'days');
    // console.log('--------------');
    // console.log(pre);

    let isHoliday = false;

    if (pre.isoWeekday() === 6 || pre.isoWeekday() === 7) {
        isHoliday = true;
    } else {
        let lines = fs.readFileSync(__dirname + '/../data/holidays/' + year + '.txt', 'utf8').split('\n');
        // console.log(lines);

        for (let i = 0; i < lines.length; i++) {
            let str = lines[i].split(' ');
            if (pre.isSame(str[0], 'day')) {
                isHoliday = true;
                // console.log(str);
                // console.log('is holiday');
                break;
            }
        }
    }

    if (isHoliday) {
        return preTradeDay(Utils.shortDayStr(pre));
    } else {
        return Utils.shortDayStr(mo);
    }
};

async function generatePopIndex(latestDate: string) {
    console.log('Generate PopIndex:' + latestDate);

    let preDate = preTradeDay(latestDate);

    let stocks = getDayPopStocks(preDate);
    if (stocks === null || stocks.length === 0) return;
    // console.log(stocks);

    let max = 3;
    let count = stocks.length >= max ? max : stocks.length;
    // let preclose = 1000;

    console.log("last trade date:" + preDate);

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
    // res.trend = new Array();
    for (let j = 0; j < count; j++) {
        // console.log('j:' + j);

        let stock = stocks[j];
        console.log(stock);

        let fileName = path.join(__dirname, '/../fetched/trend/', stock[1], '/', latestDate + '.txt');
        console.log(fileName);

        // console.log('before read==>' + moment().valueOf());
        let trendsData = fs.readFileSync(fileName, 'utf8');
        // console.log(trendsData.length);
        // console.log('after read==>' + moment().valueOf());

        console.log('=====>' + stock[1] + ' ' + latestDate);

        let code = getCode(stock[1]);
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

    let folder = path.join(__dirname, '/../data/pop3')
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    fs.writeFileSync(folder + '/' + latestDate + '.txt', JSON.stringify(res));
}

async function fetchData() {
    let lines = fs.readFileSync(__dirname + '/../data/list.txt', 'utf8').split('\n');

    console.log('Total popular size:' + lines.length);
    // console.log(lines);
    // console.log('Before ' + moment().valueOf());

    let req = new Array();
    let codes = new Array()
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === null || lines[i].length === 0) continue;
        // console.log(lines[i]);
        // console.log('i::' + moment().valueOf());

        // let arr = generateTrendDataRequest(getCode(lines[i]));
        let code = getCode(lines[i]);
        codes.push(code)
        req.push(axios.get('https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=' + code));
        // console.log('i=>' + moment().valueOf());

    }
    // console.log(codes);

    let latestDate = ''
    await axios.all(req).then(results => {
        console.log('fetch end ' + moment().valueOf());

        for (let j = 0; j < results.length; j++) {
            // console.log('j::' + j + ' ' + moment().valueOf());
            let response = results[j];

            let resData = response.data;
            // console.log(resData);
            if (response.status === 200 && resData !== null) {
                // console.log('Response:' + response.status + "/" + response.statusText);
                let trendsObj = resData.data[codes[j]].data;
                let date = trendsObj.date;
                // console.log('date:' + date);

                latestDate = date;
                // console.log('before save data:' + moment().valueOf());
                saveTrendData(resData, date, lines[j]);
                // console.log('after save data:' + moment().valueOf());
                // console.log('trends:' + trends.length);
            } else {
                console.log('Response:' + response.status + "/" + response.statusText);
            }
        }
    }).catch(error => {
        console.log('Axios fetch all data error:' + error);
    });

    generatePopIndex(latestDate);
    // console.log('End ' + moment().valueOf());
}

let timer = null;
function timeTick() {
    let now = moment();
    console.log(now);

    let target = now.clone().hour(15).minute(31).second(0).millisecond(0);

    console.log(target);

    let ms = target.valueOf() - now.valueOf();
    console.log('Fetch trends left time:' + ms);

    if (ms > -200 && ms < 200) {
        target.add(1, 'day');
        console.log('Trigger fetch trends, next trigger time:' + target.format('YYYY-MM-DD HH:mm:ss'));
        timer = setTimeout(timeTick, target.valueOf() - moment().valueOf());
        fetchData();
    } else {
        if (ms <= -200) {
            target.add(1, 'day');
        }

        console.log('Next fetch trends time:' + target.format('YYYY-MM-DD HH:mm:ss'));
        timer = setTimeout(timeTick, target.valueOf() - moment().valueOf());
    }
};
// generatePopIndex('20220802');
// generatePopIndex('20220803');
// generatePopIndex('20220804');
timeTick();