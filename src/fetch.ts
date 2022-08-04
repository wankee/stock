import fs = require('fs');
import moment = require('moment');
import Utils from './utils';
const axios = require('axios');
const path = require("path")

function saveOrignData(folder: string, time: moment.Moment, data: any) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    fs.writeFile(
        folder + '/' + time.format("YYYYMMDDHHmmss") + '.txt',
        JSON.stringify(data),
        err => {
            if (err) {
                console.log('writeFile error:' + err);
            }
        }
    );
}

function saveFormatData(folder: string, data: string) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

    fs.appendFile(folder + '/popular.txt', data,
        err => {
            if (err) {
                console.log('writeFile error:' + err);
            }
        }
    );
}

let popularStocks = new Array();
let minOrder = 20;

/** 保存热门数据 */
function savePopularData(data: any, type: string) {
    let now = moment();
    try {
        saveOrignData(__dirname + '/../fetched/' + type, now, data);

        let stock_list = data.data.stock_list;
        let res = new Array();
        for (let i = 0; i < stock_list.length; i++) {
            let stock = stock_list[i];
            let item = [stock.order, stock.code, stock.name, stock.rate, stock.hot_rank_chg];
            res.push(item);

            if (i < minOrder) {
                if (popularStocks.indexOf(stock.code) === -1) {
                    popularStocks.push(stock.code);
                }
            }
        }
        let output = now.format("YYYYMMDDHHmmss") + ':' + JSON.stringify(res) + '\n';

        saveFormatData(__dirname + '/../data/' + type, output);

    } catch (err) {
        console.error('fs error:' + err);
    }
}

async function fetchDayHot() {
    await axios.get('https://eq.10jqka.com.cn/open/api/hot_list/v1/hot_stock/a/day/data.txt')
        .then(response => {
            if (response.status === 200 && response.data !== null) {
                // console.log('Response:' + response.status + "/" + response.statusText);
                savePopularData(response.data, 'dayhot');

            } else {
                console.log('Response:' + response.status + "/" + response.statusText);
            }
        }).catch(error => {
            console.log('Axios get day hot error:' + error);
        });
}

async function fetchHourHot() {
    await axios.get('https://eq.10jqka.com.cn/open/api/hot_list/v1/hot_stock/a/hour/data.txt')
        .then(response => {
            if (response.status === 200 && response.data !== null) {
                // console.log('Response:' + response.status + "/" + response.statusText);
                savePopularData(response.data, 'hourhot');
            } else {
                console.log('Response:' + response.status + "/" + response.statusText);
            }
        }).catch(error => {
            console.log('Axios get hour hot error:' + error);
        });
}

/** 保存分时数据 */
function saveTrendData(data: any, date: string, stockId: string) {
    let folder = __dirname + '/../fetched/trend/' + stockId;
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    fs.writeFile(
        folder + '/' + date + '.txt',
        JSON.stringify(data),
        err => {
            if (err) {
                console.log('saveTrendData error:' + err);
            }
        }
    );
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

function savePopularStocks() {
    let folder = __dirname + '/../data';
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    let file = folder + '/list.txt';
    let str = '';
    if (!fs.existsSync(file)) {
        console.log('List file not exist');
        for (let j = 0; j < popularStocks.length; j++) {
            let stock = popularStocks[j];
            str += stock + '\n';
        }

        fs.writeFile(file, str,
            err => {
                if (err) {
                    console.log('savePopularStocks error:' + err);
                }
            }
        );
    } else {
        console.log('List file exist!');

        let lines = fs.readFileSync(file, 'utf8').split('\n');

        for (let j = 0; j < popularStocks.length; j++) {
            let stock = popularStocks[j];
            if (!lines.includes(stock)) {
                str += stock + '\n';
            }
        }

        fs.appendFile(file, str,
            err => {
                if (err) {
                    console.log('save stock list error:' + err);
                }
            }
        );
    }
}

async function fetchData() {
    popularStocks = new Array();
    await fetchDayHot();
    await fetchHourHot();
    console.log('Popular stock size:' + popularStocks.length);
    // console.log(toFetchStocks);
    savePopularStocks();
}

/** 获取节假日 */
function getTradeDay() {
    let now = moment();
    if (now.hour() !== 0) return;

    let year = now.year();
    let endYear = year + 1;
    let start = Utils.shortDay(year + '0101').unix();
    let end = Utils.shortDay(endYear + '0101').unix();

    let url = 'https://www.jisilu.cn/data/calendar/get_calendar_data/?qtype=OTHER&start=' + start + '&end=' + end;
    // console.log(url);
    axios.get(url)
        .then(response => {
            if (response.status === 200 && response.data !== null) {
                let data = response.data;
                let str = '';
                let tem = new Array()

                for (let i = 0; i < data.length; i++) {
                    let info = data[i];
                    if (info.title !== null && info.title.includes('A股休市')) {
                        if (info.start.startsWith(year)) {
                            let s = info.start.substring(0, 10) + ' ' + info.description;
                            if (!tem.includes(s)) {
                                tem.push(s);
                                str += s + '\n';
                            }
                        }
                    }
                }
                console.log(str);

                let folder = path.join(__dirname, '../data/holidays');
                if (!fs.existsSync(folder)) {
                    fs.mkdirSync(folder, { recursive: true });
                }

                fs.writeFileSync(folder + '/' + year + '.txt', str);
            } else {
                console.log('Response:' + response.status + "/" + response.statusText);
            }
        }).catch(error => {
            console.log('Axios get trade day error:' + error);
        });
}

let timer = null;
function timeFunc() {
    let now = moment();
    console.log(now);

    let target = now.clone().minute(30).second(0).millisecond(0);
    console.log(target);

    let ms = target.valueOf() - now.valueOf();
    console.log('Fetch popular left time:' + ms);

    if (ms > -200 && ms < 200) {
        target.add(1, 'hour');
        console.log('Trigger fetch popular,next trigger time:' + target.format('YYYY-MM-DD HH:mm:ss'));
        timer = setTimeout(timeFunc, target.valueOf() - moment().valueOf());
        getTradeDay();
        fetchData();
    } else {
        if (ms <= -200) {
            target.add(1, 'hour');
        }

        console.log('Next fetch popular time:' + target.format('YYYY-MM-DD HH:mm:ss'));
        timer = setTimeout(timeFunc, target.valueOf() - moment().valueOf());
    }
};
timeFunc();