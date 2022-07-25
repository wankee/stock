import fs = require('fs');
import moment = require('moment');
const axios = require('axios');

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

let toFetchStocks = new Array();
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
                if (toFetchStocks.indexOf(stock.code) === -1) {
                    toFetchStocks.push(stock.code);
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
            // console.log('Response:' + response.status + "/" + response.statusText);
            // console.log('Response:' + response.data.code);
            saveTrendData(response.data, date, stockId);

        } else {
            console.log('Response:' + response.status + "/" + response.statusText);
        }
    }).catch(error => {
        console.log('Axios fetchHistoryTrend error:' + error);
    });
}

function fetchTrendData(date: string, stockId: string) {
    let code = stockId;
    if (stockId.startsWith('60')) {
        code = 'sh' + stockId;
    } else {
        code = 'sz' + stockId;
    }

    axios.get('https://web.ifzq.gtimg.cn/appstock/app/minute/query?code=' + code).then(response => {
        if (response.status === 200 && response.data !== null) {
            // console.log('Response:' + response.status + "/" + response.statusText);
            let date = response.data.data[code].data.date;
            // console.log('Response:' + );
            saveTrendData(response.data, date, stockId);

        } else {
            console.log('Response:' + response.status + "/" + response.statusText);
        }
    }).catch(error => {
        console.log('Axios fetchTrendData error:' + error);
    });
}

async function fetchData() {
    toFetchStocks = new Array();
    await fetchDayHot();
    await fetchHourHot();
    console.log('To fetch size:' + toFetchStocks.length);
    // console.log(toFetchStocks);
    for (let i = 0; i < toFetchStocks.length; i++) {
        fetchTrendData(moment().format('YYYYMMDD'), toFetchStocks[i]);
    }
}

let timer = null;
function timeFunc() {
    let now = moment();
    console.log(now);

    // let target = moment('01:30:00', 'HH:mm:ss');
    // let target = moment('00', 'ss');
    let target = now.clone().minute(30).second(0).millisecond(0);

    console.log(target);

    let ms = target.valueOf() - now.valueOf();
    console.log('left time:' + ms);

    if (ms > -200 && ms < 200) {
        fetchData()
        target.add(1, 'hour');
        console.log('Trigger fetch,next trigger time:' + target.format('YYYY-MM-DD HH:mm:ss'));
        timer = setTimeout(timeFunc, target.valueOf() - moment().valueOf());
    } else {
        if (ms <= -200) {
            target.add(1, 'hour');
        }

        console.log('next trigger time:' + target.format('YYYY-MM-DD HH:mm:ss'));
        timer = setTimeout(timeFunc, target.valueOf() - moment().valueOf());
    }
};
timeFunc();
// fetchData();