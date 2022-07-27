import fs = require('fs');
import moment = require('moment');
const axios = require('axios');

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

function fetchTrendData(stockId: string) {
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
        console.log('Axios fetchTrendData error:' + error + ' stock:' + stockId);
    });
}

async function fetchData() {
    let lines = fs.readFileSync(__dirname + '/../data/list.txt', 'utf8').split('\n');

    console.log('To fetch size:' + lines.length);
    // console.log(toFetchStocks);
    for (let i = 0; i < lines.length; i++) {
        if (lines[i] === null || lines[i].length === 0) continue;
        console.log(lines[i]);
        fetchTrendData(lines[i]);
    }
}

let timer = null;
function timeTick() {
    let now = moment();
    console.log(now);

    // let target = moment('01:30:00', 'HH:mm:ss');
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
timeTick();
// fetchData();